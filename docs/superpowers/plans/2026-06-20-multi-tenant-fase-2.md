# Multi-Tenant Fase 2 (Onboarding APIs) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Backend onboarding APIs so a platform super-admin can create/manage Pemda (organizations) and an org-admin can manage their own users (incl. CSV import), roles, and offices — all correctly tenant-scoped.

**Architecture:** Builds on Fase 1. `User` and `Role` deliberately have NO global scope, so admin listings are scoped manually via `TenantContext` (`when($orgId, …)`): a platform super-admin (`organization_id = null` → `TenantContext` empty) sees all; an org-admin sees only their org. Creating an organization seeds its default roles (`OrganizationRoleTemplateSeeder`) and its first org-admin. Offices are already globally scoped (Fase 1 trait), so office CRUD auto-stamps the org.

**Tech Stack:** Laravel 13, PHP 8.3, Sanctum, PostgreSQL, PHPUnit 12 (sqlite in-memory).

---

## Task 1: Org-scope admin user & role listings

**Files:**
- Modify: `absen-backend/app/Http/Controllers/Api/AdminUserController.php`
- Modify: `absen-backend/app/Http/Controllers/Api/RoleController.php`
- Test: `absen-backend/tests/Feature/AdminScopingTest.php`

- [ ] **Step 1: Write the failing test**

```php
<?php
namespace Tests\Feature;

use App\Models\Organization;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\OrganizationRoleTemplateSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminScopingTest extends TestCase
{
    use RefreshDatabase;

    public function test_org_admin_only_lists_own_org_users_and_roles(): void
    {
        (new RolePermissionSeeder())->run();
        $orgA = Organization::create(['name' => 'A', 'code' => 'a']);
        $orgB = Organization::create(['name' => 'B', 'code' => 'b']);
        (new OrganizationRoleTemplateSeeder())->forOrganization($orgA->id);
        (new OrganizationRoleTemplateSeeder())->forOrganization($orgB->id);

        $adminRoleA = Role::where('organization_id', $orgA->id)->where('name', 'org_admin')->first();
        $adminA = User::create(['name' => 'Admin A', 'email' => 'admin@a.test', 'password' => bcrypt('x'), 'organization_id' => $orgA->id, 'role_id' => $adminRoleA->id]);
        User::create(['name' => 'Staff B', 'email' => 'staff@b.test', 'password' => bcrypt('x'), 'organization_id' => $orgB->id]);

        Sanctum::actingAs($adminA);

        $users = $this->getJson('/api/admin/users')->assertOk()->json();
        $emails = collect($users)->pluck('email')->all();
        $this->assertContains('admin@a.test', $emails);
        $this->assertNotContains('staff@b.test', $emails);

        $roles = $this->getJson('/api/roles')->assertOk()->json();
        $orgIds = collect($roles)->pluck('organization_id')->unique()->values()->all();
        $this->assertEquals([$orgA->id], $orgIds);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd absen-backend && php artisan test --filter=AdminScopingTest`
Expected: FAIL — staff@b.test appears (no scoping).

- [ ] **Step 3: Scope `AdminUserController::index`**

In `AdminUserController.php`, add the import `use App\Support\TenantContext;` and change the query:

```php
public function index(Request $request)
{
    $this->authorizeManage($request);

    $orgId = app(TenantContext::class)->id();

    $users = User::with('role')
        ->when($orgId, fn ($q) => $q->where('organization_id', $orgId))
        ->orderBy('name')
        ->get()
        ->map(fn ($u) => [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'position' => $u->position,
            'department' => $u->department,
            'role' => $u->role ? ['id' => $u->role->id, 'name' => $u->role->name, 'label' => $u->role->label] : null,
        ]);

    return response()->json($users);
}
```

- [ ] **Step 4: Scope `RoleController::index` and `show`**

In `RoleController.php`, add `use App\Support\TenantContext;`. Change `index`:

```php
public function index(Request $request)
{
    $this->authorizeManage($request);

    $orgId = app(TenantContext::class)->id();
    $roles = Role::withCount(['permissions', 'users'])
        ->when($orgId, fn ($q) => $q->where('organization_id', $orgId))
        ->orderBy('id')
        ->get();

    return response()->json($roles);
}
```

In `show`, scope the lookup so an org-admin can't open another org's role:

```php
$orgId = app(TenantContext::class)->id();
$role = Role::when($orgId, fn ($q) => $q->where('organization_id', $orgId))->find($id);
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd absen-backend && php artisan test --filter=AdminScopingTest`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add absen-backend/app/Http/Controllers/Api/AdminUserController.php absen-backend/app/Http/Controllers/Api/RoleController.php absen-backend/tests/Feature/AdminScopingTest.php
git commit -m "feat(tenancy): scope admin user & role listings to current org"
```

---

## Task 2: OrganizationController — list & create (platform super-admin)

**Files:**
- Create: `absen-backend/app/Http/Controllers/Api/OrganizationController.php`
- Modify: `absen-backend/routes/api.php`
- Test: `absen-backend/tests/Feature/OrganizationCrudTest.php`

- [ ] **Step 1: Write the failing test**

```php
<?php
namespace Tests\Feature;

use App\Models\Organization;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrganizationCrudTest extends TestCase
{
    use RefreshDatabase;

    private function platformAdmin(): User
    {
        (new RolePermissionSeeder())->run();
        $role = Role::whereNull('organization_id')->where('name', 'platform_superadmin')->first();
        return User::create(['name' => 'Vendor', 'email' => 'v@x.test', 'password' => bcrypt('x'), 'organization_id' => null, 'role_id' => $role->id]);
    }

    public function test_platform_admin_creates_org_with_roles_and_first_admin(): void
    {
        Sanctum::actingAs($this->platformAdmin());

        $res = $this->postJson('/api/admin/organizations', [
            'name' => 'Pemda Bekasi',
            'code' => 'bekasi',
            'admin_name' => 'Admin Bekasi',
            'admin_email' => 'admin@bekasi.test',
            'admin_password' => 'secret123',
        ])->assertCreated();

        $orgId = $res->json('organization.id');
        $this->assertDatabaseHas('organizations', ['code' => 'bekasi']);
        $this->assertCount(4, Role::where('organization_id', $orgId)->get());
        $this->assertDatabaseHas('users', ['email' => 'admin@bekasi.test', 'organization_id' => $orgId]);
    }

    public function test_non_platform_admin_forbidden(): void
    {
        $org = Organization::create(['name' => 'A', 'code' => 'a']);
        $user = User::create(['name' => 'U', 'email' => 'u@a.test', 'password' => bcrypt('x'), 'organization_id' => $org->id]);
        Sanctum::actingAs($user);

        $this->postJson('/api/admin/organizations', ['name' => 'X', 'code' => 'x', 'admin_name' => 'a', 'admin_email' => 'a@x.test', 'admin_password' => 'secret123'])
            ->assertForbidden();
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd absen-backend && php artisan test --filter=OrganizationCrudTest`
Expected: FAIL — route/controller missing (404/500).

- [ ] **Step 3: Create the controller**

```php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\OrganizationRoleTemplateSeeder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrganizationController extends Controller
{
    private function authorizePlatform(Request $request): void
    {
        abort_unless($request->user()->isPlatformSuperadmin(), 403, 'Hanya super-admin platform.');
    }

    public function index(Request $request)
    {
        $this->authorizePlatform($request);
        return response()->json(Organization::withCount('users')->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $this->authorizePlatform($request);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|alpha_dash|unique:organizations,code',
            'logo_url' => 'nullable|string|max:1000',
            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|email|max:255',
            'admin_password' => 'required|string|min:8',
        ]);

        $result = DB::transaction(function () use ($data) {
            $org = Organization::create([
                'name' => $data['name'],
                'code' => $data['code'],
                'logo_url' => $data['logo_url'] ?? null,
            ]);

            (new OrganizationRoleTemplateSeeder())->forOrganization($org->id);

            $orgAdminRole = Role::where('organization_id', $org->id)->where('name', 'org_admin')->first();
            $admin = User::create([
                'organization_id' => $org->id,
                'name' => $data['admin_name'],
                'email' => $data['admin_email'],
                'password' => bcrypt($data['admin_password']),
                'role_id' => $orgAdminRole?->id,
                'position' => 'Administrator',
            ]);

            return ['org' => $org, 'admin' => $admin];
        });

        return response()->json([
            'message' => 'Instansi berhasil dibuat.',
            'organization' => $result['org'],
            'admin' => ['id' => $result['admin']->id, 'email' => $result['admin']->email],
        ], 201);
    }
}
```

- [ ] **Step 4: Add routes (inside the `auth:sanctum`,`tenant` group)**

In `absen-backend/routes/api.php`, near the admin routes:

```php
Route::get('/admin/organizations', [\App\Http\Controllers\Api\OrganizationController::class, 'index']);
Route::post('/admin/organizations', [\App\Http\Controllers\Api\OrganizationController::class, 'store']);
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd absen-backend && php artisan test --filter=OrganizationCrudTest`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add absen-backend/app/Http/Controllers/Api/OrganizationController.php absen-backend/routes/api.php absen-backend/tests/Feature/OrganizationCrudTest.php
git commit -m "feat(tenancy): platform org create (with role seed + first org-admin) and list"
```

---

## Task 3: OrganizationController — update

**Files:**
- Modify: `absen-backend/app/Http/Controllers/Api/OrganizationController.php`
- Modify: `absen-backend/routes/api.php`
- Test: add to `OrganizationCrudTest`

- [ ] **Step 1: Add the failing test method**

```php
public function test_platform_admin_updates_org(): void
{
    Sanctum::actingAs($this->platformAdmin());
    $org = Organization::create(['name' => 'Old', 'code' => 'old']);

    $this->putJson("/api/admin/organizations/{$org->id}", ['name' => 'New Name', 'is_active' => false])
        ->assertOk()
        ->assertJsonPath('organization.name', 'New Name');

    $this->assertDatabaseHas('organizations', ['id' => $org->id, 'name' => 'New Name', 'is_active' => false]);
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd absen-backend && php artisan test --filter=OrganizationCrudTest`
Expected: FAIL — update route missing.

- [ ] **Step 3: Add `update` to the controller**

```php
public function update(Request $request, $id)
{
    $this->authorizePlatform($request);
    $org = Organization::findOrFail($id);

    $data = $request->validate([
        'name' => 'sometimes|string|max:255',
        'logo_url' => 'nullable|string|max:1000',
        'is_active' => 'sometimes|boolean',
    ]);

    $org->update($data);

    return response()->json(['message' => 'Instansi diperbarui.', 'organization' => $org]);
}
```

- [ ] **Step 4: Add the route**

```php
Route::put('/admin/organizations/{id}', [\App\Http\Controllers\Api\OrganizationController::class, 'update']);
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd absen-backend && php artisan test --filter=OrganizationCrudTest`
Expected: PASS (all 3 methods).

- [ ] **Step 6: Commit**

```bash
git add absen-backend/app/Http/Controllers/Api/OrganizationController.php absen-backend/routes/api.php absen-backend/tests/Feature/OrganizationCrudTest.php
git commit -m "feat(tenancy): platform org update"
```

---

## Task 4: Create user in org (org-admin)

**Files:**
- Modify: `absen-backend/app/Http/Controllers/Api/AdminUserController.php`
- Modify: `absen-backend/routes/api.php`
- Test: `absen-backend/tests/Feature/AdminUserCreateTest.php`

- [ ] **Step 1: Write the failing test**

```php
<?php
namespace Tests\Feature;

use App\Models\Organization;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\OrganizationRoleTemplateSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminUserCreateTest extends TestCase
{
    use RefreshDatabase;

    public function test_org_admin_creates_user_in_own_org(): void
    {
        (new RolePermissionSeeder())->run();
        $org = Organization::create(['name' => 'A', 'code' => 'a']);
        (new OrganizationRoleTemplateSeeder())->forOrganization($org->id);
        $adminRole = Role::where('organization_id', $org->id)->where('name', 'org_admin')->first();
        $staffRole = Role::where('organization_id', $org->id)->where('name', 'staff')->first();
        $admin = User::create(['name' => 'Admin', 'email' => 'admin@a.test', 'password' => bcrypt('x'), 'organization_id' => $org->id, 'role_id' => $adminRole->id]);

        Sanctum::actingAs($admin);

        $this->postJson('/api/admin/users', [
            'name' => 'New Staff', 'email' => 'new@a.test', 'password' => 'secret123',
            'role_id' => $staffRole->id, 'department' => 'Dinas X', 'position' => 'Staff',
        ])->assertCreated();

        $this->assertDatabaseHas('users', ['email' => 'new@a.test', 'organization_id' => $org->id, 'role_id' => $staffRole->id]);
    }

    public function test_cannot_assign_role_from_another_org(): void
    {
        (new RolePermissionSeeder())->run();
        $orgA = Organization::create(['name' => 'A', 'code' => 'a']);
        $orgB = Organization::create(['name' => 'B', 'code' => 'b']);
        (new OrganizationRoleTemplateSeeder())->forOrganization($orgA->id);
        (new OrganizationRoleTemplateSeeder())->forOrganization($orgB->id);
        $adminRole = Role::where('organization_id', $orgA->id)->where('name', 'org_admin')->first();
        $roleB = Role::where('organization_id', $orgB->id)->where('name', 'staff')->first();
        $admin = User::create(['name' => 'Admin', 'email' => 'admin@a.test', 'password' => bcrypt('x'), 'organization_id' => $orgA->id, 'role_id' => $adminRole->id]);

        Sanctum::actingAs($admin);

        $this->postJson('/api/admin/users', [
            'name' => 'X', 'email' => 'x@a.test', 'password' => 'secret123', 'role_id' => $roleB->id,
        ])->assertStatus(422);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd absen-backend && php artisan test --filter=AdminUserCreateTest`
Expected: FAIL — route missing.

- [ ] **Step 3: Add `store` to `AdminUserController`**

```php
public function store(Request $request)
{
    $this->authorizeManage($request);
    $orgId = app(\App\Support\TenantContext::class)->id();

    $data = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|max:255|unique:users,email',
        'password' => 'required|string|min:8',
        'role_id' => 'nullable|exists:roles,id',
        'department' => 'nullable|string|max:255',
        'position' => 'nullable|string|max:255',
        'employee_id' => 'nullable|string|max:255',
    ]);

    // Role must belong to this org
    if (!empty($data['role_id']) && $orgId) {
        $roleOk = \App\Models\Role::where('id', $data['role_id'])->where('organization_id', $orgId)->exists();
        abort_unless($roleOk, 422, 'Role tidak valid untuk instansi ini.');
    }

    $user = User::create([
        'organization_id' => $orgId,
        'name' => $data['name'],
        'email' => $data['email'],
        'password' => bcrypt($data['password']),
        'role_id' => $data['role_id'] ?? null,
        'department' => $data['department'] ?? null,
        'position' => $data['position'] ?? null,
        'employee_id' => $data['employee_id'] ?? null,
    ]);

    return response()->json(['message' => 'Pengguna dibuat.', 'user' => $user->load('role')], 201);
}
```

- [ ] **Step 4: Add the route**

```php
Route::post('/admin/users', [AdminUserController::class, 'store']);
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd absen-backend && php artisan test --filter=AdminUserCreateTest`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add absen-backend/app/Http/Controllers/Api/AdminUserController.php absen-backend/routes/api.php absen-backend/tests/Feature/AdminUserCreateTest.php
git commit -m "feat(tenancy): org-admin create user (role validated to same org)"
```

---

## Task 5: CSV bulk import users (org-admin)

**Files:**
- Modify: `absen-backend/app/Http/Controllers/Api/AdminUserController.php`
- Modify: `absen-backend/routes/api.php`
- Test: `absen-backend/tests/Feature/AdminUserImportTest.php`

CSV format (header row required): `name,email,department,position,role` where `role` is a role NAME within the org (e.g. `staff`). Password defaults to `password` for imported users (flagged for reset).

- [ ] **Step 1: Write the failing test**

```php
<?php
namespace Tests\Feature;

use App\Models\Organization;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\OrganizationRoleTemplateSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminUserImportTest extends TestCase
{
    use RefreshDatabase;

    public function test_imports_users_from_csv(): void
    {
        (new RolePermissionSeeder())->run();
        $org = Organization::create(['name' => 'A', 'code' => 'a']);
        (new OrganizationRoleTemplateSeeder())->forOrganization($org->id);
        $adminRole = Role::where('organization_id', $org->id)->where('name', 'org_admin')->first();
        $admin = User::create(['name' => 'Admin', 'email' => 'admin@a.test', 'password' => bcrypt('x'), 'organization_id' => $org->id, 'role_id' => $adminRole->id]);

        $csv = "name,email,department,position,role\n"
             . "Budi,budi@a.test,Dinas X,Staff,staff\n"
             . "Sari,sari@a.test,Dinas Y,Supervisor,supervisor\n";
        $file = UploadedFile::fake()->createWithContent('users.csv', $csv);

        Sanctum::actingAs($admin);
        $res = $this->postJson('/api/admin/users/import', ['file' => $file])->assertOk();

        $this->assertSame(2, $res->json('imported'));
        $this->assertDatabaseHas('users', ['email' => 'budi@a.test', 'organization_id' => $org->id]);
        $staffRole = Role::where('organization_id', $org->id)->where('name', 'staff')->first();
        $this->assertDatabaseHas('users', ['email' => 'budi@a.test', 'role_id' => $staffRole->id]);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd absen-backend && php artisan test --filter=AdminUserImportTest`
Expected: FAIL — route missing.

- [ ] **Step 3: Add `import` to `AdminUserController`**

```php
public function import(Request $request)
{
    $this->authorizeManage($request);
    $orgId = app(\App\Support\TenantContext::class)->id();

    $request->validate(['file' => 'required|file|mimes:csv,txt|max:2048']);

    $rows = array_map('str_getcsv', file($request->file('file')->getRealPath(), FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES));
    $header = array_map('trim', array_shift($rows) ?: []);

    $roleIdByName = \App\Models\Role::when($orgId, fn ($q) => $q->where('organization_id', $orgId))
        ->pluck('id', 'name');

    $imported = 0;
    $skipped = [];
    foreach ($rows as $row) {
        $data = array_combine($header, array_map('trim', $row));
        if (empty($data['email']) || User::where('email', $data['email'])->exists()) {
            $skipped[] = $data['email'] ?? '(kosong)';
            continue;
        }
        User::create([
            'organization_id' => $orgId,
            'name' => $data['name'] ?? $data['email'],
            'email' => $data['email'],
            'password' => bcrypt('password'),
            'department' => $data['department'] ?? null,
            'position' => $data['position'] ?? null,
            'role_id' => $roleIdByName[$data['role'] ?? ''] ?? null,
        ]);
        $imported++;
    }

    return response()->json(['message' => 'Import selesai.', 'imported' => $imported, 'skipped' => $skipped]);
}
```

- [ ] **Step 4: Add the route**

```php
Route::post('/admin/users/import', [AdminUserController::class, 'import']);
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd absen-backend && php artisan test --filter=AdminUserImportTest`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add absen-backend/app/Http/Controllers/Api/AdminUserController.php absen-backend/routes/api.php absen-backend/tests/Feature/AdminUserImportTest.php
git commit -m "feat(tenancy): org-admin CSV bulk user import"
```

---

## Task 6: Office CRUD (org-admin)

**Files:**
- Create: `absen-backend/app/Http/Controllers/Api/OfficeController.php`
- Modify: `absen-backend/routes/api.php`
- Test: `absen-backend/tests/Feature/OfficeCrudTest.php`

Offices already auto-scope via the Fase 1 trait; create auto-stamps the active org.

- [ ] **Step 1: Write the failing test**

```php
<?php
namespace Tests\Feature;

use App\Models\Office;
use App\Models\Organization;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\OrganizationRoleTemplateSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OfficeCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_org_admin_creates_office_stamped_with_org(): void
    {
        (new RolePermissionSeeder())->run();
        $org = Organization::create(['name' => 'A', 'code' => 'a']);
        (new OrganizationRoleTemplateSeeder())->forOrganization($org->id);
        $adminRole = Role::where('organization_id', $org->id)->where('name', 'org_admin')->first();
        $admin = User::create(['name' => 'Admin', 'email' => 'admin@a.test', 'password' => bcrypt('x'), 'organization_id' => $org->id, 'role_id' => $adminRole->id]);

        Sanctum::actingAs($admin);
        $res = $this->postJson('/api/offices', [
            'name' => 'Kantor Pusat', 'latitude' => -6.2, 'longitude' => 106.8, 'radius_meters' => 100,
        ])->assertCreated();

        $this->assertDatabaseHas('offices', ['name' => 'Kantor Pusat', 'organization_id' => $org->id]);
        $this->assertSame($org->id, Office::withoutGlobalScope('organization')->find($res->json('office.id'))->organization_id);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd absen-backend && php artisan test --filter=OfficeCrudTest`
Expected: FAIL — route missing.

- [ ] **Step 3: Create `OfficeController`**

```php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Office;
use Illuminate\Http\Request;

class OfficeController extends Controller
{
    private function authorizeManage(Request $request): void
    {
        abort_unless($request->user()->hasPermission('office.manage'), 403, 'Tidak ada akses kelola kantor.');
    }

    public function store(Request $request)
    {
        $this->authorizeManage($request);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'radius_meters' => 'nullable|integer|min:10',
            'work_start' => 'nullable',
            'work_end' => 'nullable',
        ]);

        $office = Office::create($data); // organization_id auto-stamped by trait

        return response()->json(['message' => 'Kantor dibuat.', 'office' => $office], 201);
    }

    public function update(Request $request, $id)
    {
        $this->authorizeManage($request);

        $office = Office::findOrFail($id); // scoped to current org by trait

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'latitude' => 'sometimes|numeric',
            'longitude' => 'sometimes|numeric',
            'radius_meters' => 'sometimes|integer|min:10',
            'work_start' => 'nullable',
            'work_end' => 'nullable',
        ]);

        $office->update($data);

        return response()->json(['message' => 'Kantor diperbarui.', 'office' => $office]);
    }
}
```

- [ ] **Step 4: Add routes**

```php
Route::post('/offices', [\App\Http\Controllers\Api\OfficeController::class, 'store']);
Route::put('/offices/{id}', [\App\Http\Controllers\Api\OfficeController::class, 'update']);
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd absen-backend && php artisan test --filter=OfficeCrudTest`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add absen-backend/app/Http/Controllers/Api/OfficeController.php absen-backend/routes/api.php absen-backend/tests/Feature/OfficeCrudTest.php
git commit -m "feat(tenancy): org-scoped office create/update"
```

---

## Final verification

- [ ] **Run the full suite**

Run: `cd absen-backend && php artisan test`
Expected: ALL PASS (Fase 1 + Fase 2).

---

## Notes for the implementer

- Platform super-admin has `organization_id = null`, so `TenantContext` stays empty and `when($orgId, …)` skips the filter → they see everything. Org-admins are always scoped.
- `office.manage` / `users.manage` permissions come from the per-org role template (org_admin has all; supervisor/staff don't), so authorization is already correct per role.
- Frontend admin screens (Organizations management, user/office forms, CSV upload UI) are the next slice — this plan delivers the APIs they consume.
- Imported users get password `password` — production should switch to invite emails / forced reset (out of scope here).
