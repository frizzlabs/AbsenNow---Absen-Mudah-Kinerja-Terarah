# Multi-Tenant Fase 1 (Backend Foundation) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the backend foundation for row-level multi-tenancy (one DB, many Pemda) so every tenant model is automatically scoped by `organization_id`, with a platform super-admin tier that can cross tenants.

**Architecture:** Single shared Postgres DB. A new `organizations` table; every tenant-owned table gets an indexed `organization_id` FK. A `TenantContext` request-scoped singleton holds the active organization. A `BelongsToOrganization` trait adds a global Eloquent scope (auto-filter on read, auto-stamp on create). A `ResolveTenant` middleware sets `TenantContext` from the authenticated user (mobile path; web subdomain comes in Fase 3). Users with role `platform_superadmin` (`organization_id = null`) bypass scoping. Data is reset and reseeded.

**Tech Stack:** Laravel 13, PHP 8.3, Laravel Sanctum, PostgreSQL, PHPUnit 12.

---

## Test database setup

Tests use `RefreshDatabase`. Configure an isolated SQLite in-memory DB for the test environment so tests never touch `absen_now`.

- [ ] **Step 1: Ensure phpunit.xml has sqlite in-memory env**

File: `absen-backend/phpunit.xml` — confirm (add if missing) inside `<php>`:

```xml
<env name="DB_CONNECTION" value="sqlite"/>
<env name="DB_DATABASE" value=":memory:"/>
```

- [ ] **Step 2: Verify the test runner works**

Run: `cd absen-backend && php artisan test`
Expected: existing `Tests\Unit\ExampleTest` and `Tests\Feature\ExampleTest` PASS.

- [ ] **Step 3: Commit**

```bash
git add absen-backend/phpunit.xml
git commit -m "test: use sqlite in-memory for the test suite"
```

---

## Task 1: `organizations` table + model

**Files:**
- Create: `absen-backend/database/migrations/2026_06_20_300000_create_organizations_table.php`
- Create: `absen-backend/app/Models/Organization.php`
- Test: `absen-backend/tests/Feature/OrganizationModelTest.php`

- [ ] **Step 1: Write the failing test**

```php
<?php
namespace Tests\Feature;

use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganizationModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_organization_with_unique_code(): void
    {
        $org = Organization::create([
            'name' => 'Pemda Tangerang',
            'code' => 'tangerang',
        ]);

        $this->assertDatabaseHas('organizations', ['code' => 'tangerang']);
        $this->assertTrue($org->is_active);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd absen-backend && php artisan test --filter=OrganizationModelTest`
Expected: FAIL — class `App\Models\Organization` not found.

- [ ] **Step 3: Create the migration**

```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('logo_url')->nullable();
            $table->json('settings')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organizations');
    }
};
```

- [ ] **Step 4: Create the model**

```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Organization extends Model
{
    protected $fillable = ['name', 'code', 'logo_url', 'settings', 'is_active'];

    protected $casts = [
        'settings' => 'array',
        'is_active' => 'boolean',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd absen-backend && php artisan test --filter=OrganizationModelTest`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add absen-backend/database/migrations/2026_06_20_300000_create_organizations_table.php absen-backend/app/Models/Organization.php absen-backend/tests/Feature/OrganizationModelTest.php
git commit -m "feat(tenancy): add organizations table and model"
```

---

## Task 2: Add `organization_id` to all tenant tables

**Files:**
- Create: `absen-backend/database/migrations/2026_06_20_300100_add_organization_id_to_tenant_tables.php`

- [ ] **Step 1: Create the migration**

```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    private array $tables = [
        'users', 'offices', 'roles',
        'attendances', 'leaves', 'leave_balances', 'expenses', 'permissions',
        'overtimes', 'timesheets', 'timesheet_events', 'activities',
        'payslips', 'payslip_items', 'kpis', 'kpi_histories', 'feedbacks',
        'performance_reviews', 'attendance_corrections', 'dinas_luar', 'user_identities',
    ];

    public function up(): void
    {
        foreach ($this->tables as $name) {
            Schema::table($name, function (Blueprint $table) {
                // nullable so platform_superadmin rows (e.g. users) can be org-less
                $table->foreignId('organization_id')->nullable()->after('id')
                    ->constrained('organizations')->nullOnDelete();
                $table->index('organization_id');
            });
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $name) {
            Schema::table($name, function (Blueprint $table) {
                $table->dropConstrainedForeignId('organization_id');
            });
        }
    }
};
```

- [ ] **Step 2: Run the migration against a scratch DB to verify it builds**

Run: `cd absen-backend && php artisan migrate:fresh --env=testing`
Expected: All migrations run with no errors (sqlite in-memory is per-process, so this just proves the schema is valid).

- [ ] **Step 3: Commit**

```bash
git add absen-backend/database/migrations/2026_06_20_300100_add_organization_id_to_tenant_tables.php
git commit -m "feat(tenancy): add organization_id to all tenant tables"
```

---

## Task 3: `TenantContext` request-scoped service

**Files:**
- Create: `absen-backend/app/Support/TenantContext.php`
- Register: `absen-backend/app/Providers/AppServiceProvider.php` (modify `register()`)
- Test: `absen-backend/tests/Unit/TenantContextTest.php`

- [ ] **Step 1: Write the failing test**

```php
<?php
namespace Tests\Unit;

use App\Support\TenantContext;
use Tests\TestCase;

class TenantContextTest extends TestCase
{
    public function test_holds_and_clears_organization_id(): void
    {
        $ctx = new TenantContext();
        $this->assertNull($ctx->id());
        $this->assertFalse($ctx->hasTenant());

        $ctx->set(7);
        $this->assertSame(7, $ctx->id());
        $this->assertTrue($ctx->hasTenant());

        $ctx->clear();
        $this->assertNull($ctx->id());
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd absen-backend && php artisan test --filter=TenantContextTest`
Expected: FAIL — class `App\Support\TenantContext` not found.

- [ ] **Step 3: Create the service**

```php
<?php
namespace App\Support;

class TenantContext
{
    private ?int $organizationId = null;

    public function set(?int $organizationId): void
    {
        $this->organizationId = $organizationId;
    }

    public function id(): ?int
    {
        return $this->organizationId;
    }

    public function hasTenant(): bool
    {
        return $this->organizationId !== null;
    }

    public function clear(): void
    {
        $this->organizationId = null;
    }
}
```

- [ ] **Step 4: Register as a singleton**

In `absen-backend/app/Providers/AppServiceProvider.php`, inside `register()`:

```php
$this->app->singleton(\App\Support\TenantContext::class);
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd absen-backend && php artisan test --filter=TenantContextTest`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add absen-backend/app/Support/TenantContext.php absen-backend/app/Providers/AppServiceProvider.php absen-backend/tests/Unit/TenantContextTest.php
git commit -m "feat(tenancy): add request-scoped TenantContext singleton"
```

---

## Task 4: `BelongsToOrganization` trait (global scope + auto-stamp)

**Files:**
- Create: `absen-backend/app/Models/Concerns/BelongsToOrganization.php`
- Test: `absen-backend/tests/Feature/OrganizationScopeTest.php`

The trait reads the active org from `TenantContext` (resolved from the container). When a tenant is set, reads are filtered and creates are stamped. When no tenant is set (e.g. platform super-admin, or seeding), no scoping is applied.

- [ ] **Step 1: Write the failing test**

```php
<?php
namespace Tests\Feature;

use App\Models\Office;
use App\Support\TenantContext;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganizationScopeTest extends TestCase
{
    use RefreshDatabase;

    public function test_reads_are_scoped_and_creates_are_stamped(): void
    {
        $ctx = app(TenantContext::class);

        // Org 1 context: create an office, it gets stamped with org 1
        $ctx->set(1);
        $a = Office::create(['name' => 'Kantor A']);
        $this->assertSame(1, $a->organization_id);

        // Org 2 context: only org-2 rows are visible
        $ctx->set(2);
        Office::create(['name' => 'Kantor B']);
        $this->assertSame(['Kantor B'], Office::pluck('name')->all());

        // Back to org 1
        $ctx->set(1);
        $this->assertSame(['Kantor A'], Office::pluck('name')->all());

        // No tenant => no scoping (platform super-admin / seeding)
        $ctx->clear();
        $this->assertCount(2, Office::all());
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd absen-backend && php artisan test --filter=OrganizationScopeTest`
Expected: FAIL — `organization_id` not stamped / not scoped (Office has no trait yet).

- [ ] **Step 3: Create the trait**

```php
<?php
namespace App\Models\Concerns;

use App\Support\TenantContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

trait BelongsToOrganization
{
    public static function bootBelongsToOrganization(): void
    {
        static::addGlobalScope('organization', function (Builder $builder) {
            $ctx = app(TenantContext::class);
            if ($ctx->hasTenant()) {
                $builder->where($builder->getModel()->getTable() . '.organization_id', $ctx->id());
            }
        });

        static::creating(function (Model $model) {
            $ctx = app(TenantContext::class);
            if ($ctx->hasTenant() && empty($model->organization_id)) {
                $model->organization_id = $ctx->id();
            }
        });
    }

    public function organization()
    {
        return $this->belongsTo(\App\Models\Organization::class);
    }
}
```

- [ ] **Step 4: Apply the trait to `Office` only (to make this test pass)**

In `absen-backend/app/Models/Office.php` add the import and `use` inside the class:

```php
use App\Models\Concerns\BelongsToOrganization;
// ...
class Office extends Model
{
    use HasFactory, BelongsToOrganization;
    // ... existing code unchanged
}
```

Also add `organization_id` to Office's fillable. Office uses the `#[Fillable(...)]` attribute — change it to:

```php
#[Fillable(['organization_id', 'name', 'latitude', 'longitude', 'radius_meters', 'work_start', 'work_end'])]
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd absen-backend && php artisan test --filter=OrganizationScopeTest`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add absen-backend/app/Models/Concerns/BelongsToOrganization.php absen-backend/app/Models/Office.php absen-backend/tests/Feature/OrganizationScopeTest.php
git commit -m "feat(tenancy): add BelongsToOrganization trait with global scope + auto-stamp"
```

---

## Task 5: Apply the trait to all remaining tenant models

**Files (modify each — add the import and `use BelongsToOrganization;`, and add `'organization_id'` to fillable):**
- `absen-backend/app/Models/Attendance.php`
- `absen-backend/app/Models/Leave.php`
- `absen-backend/app/Models/LeaveBalance.php`
- `absen-backend/app/Models/Expense.php`
- `absen-backend/app/Models/Permission.php`
- `absen-backend/app/Models/Overtime.php`
- `absen-backend/app/Models/Timesheet.php`
- `absen-backend/app/Models/TimesheetEvent.php`
- `absen-backend/app/Models/Activity.php`
- `absen-backend/app/Models/Payslip.php`
- `absen-backend/app/Models/PayslipItem.php`
- `absen-backend/app/Models/Kpi.php`
- `absen-backend/app/Models/KpiHistory.php`
- `absen-backend/app/Models/Feedback.php`
- `absen-backend/app/Models/PerformanceReview.php`
- `absen-backend/app/Models/AttendanceCorrection.php`
- `absen-backend/app/Models/DinasLuar.php`
- `absen-backend/app/Models/UserIdentity.php`

> NOTE: `User` and `Role` are handled specially in Task 6/7 (they can be org-less for platform super-admin), so they do NOT get the global-scope trait here.

- [ ] **Step 1: For EACH model file above, add the import after the namespace block**

```php
use App\Models\Concerns\BelongsToOrganization;
```

- [ ] **Step 2: For EACH model, add the trait to the `use` line inside the class**

Example (AttendanceCorrection):

```php
class AttendanceCorrection extends Model
{
    use HasFactory, BelongsToOrganization;
```

- [ ] **Step 3: For EACH model, add `'organization_id'` to the `$fillable` array** (first element). For models using the `#[Fillable([...])]` attribute, add it there instead.

- [ ] **Step 4: Run the whole suite to confirm nothing regressed**

Run: `cd absen-backend && php artisan test`
Expected: PASS (OrganizationScopeTest still green; example tests green).

- [ ] **Step 5: Commit**

```bash
git add absen-backend/app/Models
git commit -m "feat(tenancy): scope all tenant models with BelongsToOrganization"
```

---

## Task 6: `ResolveTenant` middleware (set tenant from authenticated user)

**Files:**
- Create: `absen-backend/app/Http/Middleware/ResolveTenant.php`
- Modify: `absen-backend/bootstrap/app.php` (register alias + append to `auth:sanctum` group)
- Add `organization_id` to User fillable: `absen-backend/app/Models/User.php`
- Test: `absen-backend/tests/Feature/ResolveTenantTest.php`

- [ ] **Step 1: Add `organization_id` to User fillable**

In `absen-backend/app/Models/User.php`, add `'organization_id'` to the `#[Fillable([...])]` list (first element) and add the relation method:

```php
public function organization(): \Illuminate\Database\Eloquent\Relations\BelongsTo
{
    return $this->belongsTo(\App\Models\Organization::class);
}
```

- [ ] **Step 2: Write the failing test**

```php
<?php
namespace Tests\Feature;

use App\Models\Office;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ResolveTenantTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_only_sees_their_org_offices(): void
    {
        $orgA = Organization::create(['name' => 'A', 'code' => 'a']);
        $orgB = Organization::create(['name' => 'B', 'code' => 'b']);

        // Seed offices directly (no tenant context during seeding)
        Office::withoutGlobalScope('organization')->create(['organization_id' => $orgA->id, 'name' => 'A-Office']);
        Office::withoutGlobalScope('organization')->create(['organization_id' => $orgB->id, 'name' => 'B-Office']);

        $userA = User::create([
            'name' => 'User A', 'email' => 'a@x.test', 'password' => bcrypt('secret'),
            'organization_id' => $orgA->id,
        ]);

        Sanctum::actingAs($userA);
        $res = $this->getJson('/api/offices');

        $res->assertOk();
        $names = collect($res->json())->pluck('name')->all();
        $this->assertContains('A-Office', $names);
        $this->assertNotContains('B-Office', $names);
    }
}
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd absen-backend && php artisan test --filter=ResolveTenantTest`
Expected: FAIL — both offices returned (middleware not wired yet).

- [ ] **Step 4: Create the middleware**

```php
<?php
namespace App\Http\Middleware;

use App\Support\TenantContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveTenant
{
    public function __construct(private TenantContext $tenant) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Platform super-admin is org-less and bypasses scoping.
        if ($user && $user->organization_id !== null) {
            $this->tenant->set((int) $user->organization_id);
        }

        return $next($request);
    }
}
```

- [ ] **Step 5: Register the middleware in the sanctum group**

In `absen-backend/bootstrap/app.php`, inside `->withMiddleware(function (Middleware $middleware) { ... })`, append the middleware so it runs after authentication on API routes:

```php
$middleware->alias([
    'tenant' => \App\Http\Middleware\ResolveTenant::class,
]);
```

Then in `absen-backend/routes/api.php`, add `'tenant'` to the protected group:

```php
Route::middleware(['auth:sanctum', 'tenant'])->group(function () {
    // ... existing protected routes
});
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd absen-backend && php artisan test --filter=ResolveTenantTest`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add absen-backend/app/Http/Middleware/ResolveTenant.php absen-backend/bootstrap/app.php absen-backend/routes/api.php absen-backend/app/Models/User.php absen-backend/tests/Feature/ResolveTenantTest.php
git commit -m "feat(tenancy): resolve active tenant from authenticated user"
```

---

## Task 7: Platform super-admin tier + cross-org access

**Files:**
- Test: `absen-backend/tests/Feature/PlatformSuperadminTest.php`
- (Logic already supported: org-less user → no tenant set → no scope. This task locks it with a test and adds a helper.)
- Modify: `absen-backend/app/Models/User.php` (add `isPlatformSuperadmin()` helper)

- [ ] **Step 1: Add helper to User**

```php
public function isPlatformSuperadmin(): bool
{
    return $this->organization_id === null
        && $this->role && $this->role->name === 'platform_superadmin';
}
```

- [ ] **Step 2: Write the failing test**

```php
<?php
namespace Tests\Feature;

use App\Models\Office;
use App\Models\Organization;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PlatformSuperadminTest extends TestCase
{
    use RefreshDatabase;

    public function test_platform_superadmin_sees_all_orgs(): void
    {
        $orgA = Organization::create(['name' => 'A', 'code' => 'a']);
        $orgB = Organization::create(['name' => 'B', 'code' => 'b']);
        Office::withoutGlobalScope('organization')->create(['organization_id' => $orgA->id, 'name' => 'A-Office']);
        Office::withoutGlobalScope('organization')->create(['organization_id' => $orgB->id, 'name' => 'B-Office']);

        $role = Role::create(['name' => 'platform_superadmin', 'label' => 'Platform Super Admin', 'is_system' => true]);
        $admin = User::create([
            'name' => 'Vendor', 'email' => 'vendor@x.test', 'password' => bcrypt('secret'),
            'organization_id' => null, 'role_id' => $role->id,
        ]);

        Sanctum::actingAs($admin);
        $res = $this->getJson('/api/offices');

        $res->assertOk();
        $names = collect($res->json())->pluck('name')->all();
        $this->assertContains('A-Office', $names);
        $this->assertContains('B-Office', $names);
    }
}
```

- [ ] **Step 3: Run test to verify it passes**

Run: `cd absen-backend && php artisan test --filter=PlatformSuperadminTest`
Expected: PASS (org-less user → ResolveTenant sets no tenant → global scope inactive).

- [ ] **Step 4: Commit**

```bash
git add absen-backend/app/Models/User.php absen-backend/tests/Feature/PlatformSuperadminTest.php
git commit -m "feat(tenancy): platform super-admin bypasses org scope"
```

---

## Task 8: Seeders — platform super-admin, per-org role template, demo org

**Files:**
- Create: `absen-backend/database/seeders/OrganizationRoleTemplateSeeder.php` (seeds default roles for a given org id)
- Modify: `absen-backend/database/seeders/RolePermissionSeeder.php` (seed permission master + `platform_superadmin` role only)
- Modify: `absen-backend/database/seeders/DatabaseSeeder.php` (orchestrate reset/seed: platform admin + demo org)
- Modify: `absen-backend/database/migrations/...roles_table` is unchanged; `organization_id` already added in Task 2.
- Test: `absen-backend/tests/Feature/OrganizationOnboardingSeedTest.php`

- [ ] **Step 1: Write the failing test**

```php
<?php
namespace Tests\Feature;

use App\Models\Organization;
use App\Models\Role;
use Database\Seeders\OrganizationRoleTemplateSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganizationOnboardingSeedTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeding_an_org_creates_its_default_roles(): void
    {
        $org = Organization::create(['name' => 'Pemda Demo', 'code' => 'demo']);

        (new OrganizationRoleTemplateSeeder())->forOrganization($org->id);

        $roleNames = Role::where('organization_id', $org->id)->pluck('name')->sort()->values()->all();
        $this->assertEquals(['manager', 'org_admin', 'staff', 'supervisor'], $roleNames);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd absen-backend && php artisan test --filter=OrganizationOnboardingSeedTest`
Expected: FAIL — class `OrganizationRoleTemplateSeeder` not found.

- [ ] **Step 3: Create `OrganizationRoleTemplateSeeder`**

```php
<?php
namespace Database\Seeders;

use App\Models\Role;
use App\Models\RolePermission;
use Illuminate\Database\Seeder;

class OrganizationRoleTemplateSeeder extends Seeder
{
    /** Seed the 4 default roles for a single organization and sync their permissions. */
    public function forOrganization(int $organizationId): void
    {
        $all = RolePermission::pluck('id', 'name'); // name => id

        $roles = [
            'org_admin'  => ['label' => 'Admin Instansi', 'description' => 'Mengelola seluruh modul instansi ini.', 'perms' => $all->keys()->all()],
            'manager'    => ['label' => 'Manager',         'description' => 'Operasional & persetujuan.', 'perms' => $all->keys()->filter(fn ($n) => $n !== 'users.manage')->values()->all()],
            'supervisor' => ['label' => 'Supervisor',      'description' => 'Persetujuan tim.', 'perms' => $this->supervisorPerms()],
            'staff'      => ['label' => 'Staff',           'description' => 'Karyawan umum.', 'perms' => $this->staffPerms()],
        ];

        foreach ($roles as $name => $data) {
            $role = Role::updateOrCreate(
                ['organization_id' => $organizationId, 'name' => $name],
                ['label' => $data['label'], 'description' => $data['description'], 'is_system' => true],
            );
            $ids = collect($data['perms'])->map(fn ($n) => $all[$n] ?? null)->filter()->values()->all();
            $role->permissions()->sync($ids);
        }
    }

    private function supervisorPerms(): array
    {
        return array_merge(
            ['attendance.view', 'activity.view', 'timesheet.view', 'leave.view', 'overtime.view', 'expense.view', 'permission.view', 'payslip.view', 'performance.view', 'profile.view', 'office.view', 'users.view'],
            ['attendance.create', 'activity.create', 'timesheet.create', 'leave.create', 'overtime.create', 'expense.create', 'permission.create'],
            ['attendance.approve', 'timesheet.approve', 'leave.approve', 'overtime.approve', 'expense.approve', 'permission.approve'],
            ['profile.manage'],
        );
    }

    private function staffPerms(): array
    {
        return array_merge(
            ['attendance.view', 'activity.view', 'timesheet.view', 'leave.view', 'overtime.view', 'expense.view', 'permission.view', 'payslip.view', 'performance.view', 'profile.view'],
            ['attendance.create', 'activity.create', 'timesheet.create', 'leave.create', 'overtime.create', 'expense.create', 'permission.create'],
            ['profile.manage'],
        );
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd absen-backend && php artisan test --filter=OrganizationOnboardingSeedTest`
Expected: PASS.

> NOTE: `Role` must allow mass-assigning `organization_id`. In `absen-backend/app/Models/Role.php` add `'organization_id'` to `$fillable`.

- [ ] **Step 5: Rewrite `RolePermissionSeeder` to seed only the permission master + platform_superadmin**

Replace the body of `run()` so it (a) seeds the permission master exactly as today (keep the `$modules`/`$actionLabels` loop and the `RolePermission::updateOrCreate` block), then (b) seeds ONLY the platform role and drops the old per-app role/user assignment block:

```php
public function run(): void
{
    // (a) Seed permission master — keep the existing modules loop unchanged.
    foreach ($this->modules as $module => $cfg) {
        foreach ($cfg['actions'] as $action) {
            RolePermission::updateOrCreate(
                ['name' => "$module.$action"],
                ['module' => $module, 'action' => $action,
                 'module_label' => $cfg['label'], 'action_label' => $this->actionLabels[$action]],
            );
        }
    }

    // (b) Platform-level role (organization_id = null), full access.
    Role::updateOrCreate(
        ['organization_id' => null, 'name' => 'platform_superadmin'],
        ['label' => 'Platform Super Admin', 'description' => 'Vendor lintas-instansi.', 'is_system' => true],
    );
}
```

Delete the old steps 2–4 in that file (the per-app `$roles` creation, `syncRole` calls, and the `User::where('email', ...)` assignments). Keep the `names()` and `syncRole()` helpers only if still referenced; otherwise delete them.

- [ ] **Step 6: Update `DatabaseSeeder` to create the platform admin + a demo org**

```php
<?php
namespace Database\Seeders;

use App\Models\Organization;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);

        // Platform super-admin (org-less)
        $platformRole = Role::where('organization_id', null)->where('name', 'platform_superadmin')->first();
        User::updateOrCreate(
            ['email' => 'vendor@absennow.id'],
            ['name' => 'Platform Admin', 'password' => bcrypt('password'),
             'organization_id' => null, 'role_id' => $platformRole->id],
        );

        // Demo Pemda + its default roles + one org-admin
        $demo = Organization::updateOrCreate(['code' => 'demo'], ['name' => 'Pemda Demo', 'is_active' => true]);
        (new OrganizationRoleTemplateSeeder())->forOrganization($demo->id);
        $orgAdminRole = Role::where('organization_id', $demo->id)->where('name', 'org_admin')->first();
        User::updateOrCreate(
            ['email' => 'admin@demo.absennow.id'],
            ['name' => 'Admin Demo', 'password' => bcrypt('password'),
             'organization_id' => $demo->id, 'role_id' => $orgAdminRole->id],
        );
    }
}
```

- [ ] **Step 7: Reset and reseed the real dev DB**

Run: `cd absen-backend && php artisan migrate:fresh --seed`
Expected: Fresh schema; `organizations` has `demo`; users `vendor@absennow.id` (org null) and `admin@demo.absennow.id` (org demo) exist.

- [ ] **Step 8: Run the whole suite**

Run: `cd absen-backend && php artisan test`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add absen-backend/database/seeders absen-backend/app/Models/Role.php absen-backend/tests/Feature/OrganizationOnboardingSeedTest.php
git commit -m "feat(tenancy): platform role + per-org role template + demo seed; reset data"
```

---

## Task 9: Public branding endpoint `GET /tenant/{code}`

**Files:**
- Create: `absen-backend/app/Http/Controllers/Api/TenantController.php`
- Modify: `absen-backend/routes/api.php` (public route, outside auth group)
- Test: `absen-backend/tests/Feature/TenantBrandingTest.php`

- [ ] **Step 1: Write the failing test**

```php
<?php
namespace Tests\Feature;

use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantBrandingTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_public_branding_by_code(): void
    {
        Organization::create(['name' => 'Pemda Tangerang', 'code' => 'tangerang', 'logo_url' => 'https://x/l.png']);

        $this->getJson('/api/tenant/tangerang')
            ->assertOk()
            ->assertJson(['name' => 'Pemda Tangerang', 'code' => 'tangerang', 'logo_url' => 'https://x/l.png']);
    }

    public function test_unknown_code_returns_404(): void
    {
        $this->getJson('/api/tenant/nope')->assertNotFound();
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd absen-backend && php artisan test --filter=TenantBrandingTest`
Expected: FAIL — route not defined (404 for the valid case too).

- [ ] **Step 3: Create the controller**

```php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;

class TenantController extends Controller
{
    public function show(string $code)
    {
        $org = Organization::where('code', $code)->where('is_active', true)->firstOrFail();

        return response()->json([
            'name' => $org->name,
            'code' => $org->code,
            'logo_url' => $org->logo_url,
        ]);
    }
}
```

- [ ] **Step 4: Add the public route (outside the auth group)**

In `absen-backend/routes/api.php`, near the other public routes (e.g. after `/login`):

```php
Route::get('/tenant/{code}', [\App\Http\Controllers\Api\TenantController::class, 'show']);
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd absen-backend && php artisan test --filter=TenantBrandingTest`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add absen-backend/app/Http/Controllers/Api/TenantController.php absen-backend/routes/api.php absen-backend/tests/Feature/TenantBrandingTest.php
git commit -m "feat(tenancy): public tenant branding endpoint"
```

---

## Task 10: Cross-tenant isolation guard (negative test) + approval guard

**Files:**
- Test: `absen-backend/tests/Feature/CrossTenantIsolationTest.php`
- Modify (if test reveals a gap): `absen-backend/app/Http/Controllers/Api/AttendanceCorrectionController.php` `review()` to ensure the reviewer and the correction share an org.

- [ ] **Step 1: Write the failing test**

```php
<?php
namespace Tests\Feature;

use App\Models\AttendanceCorrection;
use App\Models\Organization;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CrossTenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_supervisor_cannot_review_other_orgs_correction(): void
    {
        $this->seed(\Database\Seeders\RolePermissionSeeder::class);
        $orgA = Organization::create(['name' => 'A', 'code' => 'a']);
        $orgB = Organization::create(['name' => 'B', 'code' => 'b']);
        (new \Database\Seeders\OrganizationRoleTemplateSeeder())->forOrganization($orgA->id);

        $supRole = Role::where('organization_id', $orgA->id)->where('name', 'supervisor')->first();
        $supA = User::create(['name' => 'Sup A', 'email' => 'sup@a.test', 'password' => bcrypt('x'),
            'organization_id' => $orgA->id, 'role_id' => $supRole->id]);

        // A correction owned by org B
        $correction = AttendanceCorrection::withoutGlobalScope('organization')->create([
            'organization_id' => $orgB->id, 'user_id' => 999,
            'correction_date' => '2026-06-15', 'correction_type' => 'forgot_checkin',
            'justification' => 'cross tenant attempt', 'status' => 'pending',
        ]);

        Sanctum::actingAs($supA);
        $this->putJson("/api/attendance/corrections/{$correction->id}/review", [
            'status' => 'approved',
        ])->assertNotFound(); // scoped query => findOrFail can't see org B's row
    }
}
```

- [ ] **Step 2: Run test to verify it fails or passes**

Run: `cd absen-backend && php artisan test --filter=CrossTenantIsolationTest`
Expected: PASS if the controller uses the scoped model (`AttendanceCorrection::...findOrFail` now auto-filters by org → 404). If it returns 200/403 instead, proceed to Step 3.

- [ ] **Step 3: If it did not 404, add an explicit org guard in `review()`**

In `absen-backend/app/Http/Controllers/Api/AttendanceCorrectionController.php`, the `review()` currently does `AttendanceCorrection::with('user')->findOrFail($id)`. With the global scope active this already 404s for other orgs. If the controller used `withoutGlobalScope` anywhere, remove it. Ensure the lookup is the plain scoped `findOrFail`.

- [ ] **Step 4: Run the whole suite**

Run: `cd absen-backend && php artisan test`
Expected: ALL PASS.

- [ ] **Step 5: Commit**

```bash
git add absen-backend/tests/Feature/CrossTenantIsolationTest.php absen-backend/app/Http/Controllers/Api/AttendanceCorrectionController.php
git commit -m "test(tenancy): cross-tenant isolation for correction review"
```

---

## Final verification

- [ ] **Run the full suite**

Run: `cd absen-backend && php artisan test`
Expected: ALL PASS.

- [ ] **Sanity-check the seeded data**

Run: `cd absen-backend && php artisan migrate:fresh --seed && php artisan tinker --execute="echo App\Models\Organization::count().' orgs; '.App\Models\User::whereNull('organization_id')->count().' platform users';"`
Expected: `1 orgs; 1 platform users` (demo org + vendor platform admin).

---

## Notes for the implementer

- The global scope keys off `TenantContext`, which `ResolveTenant` sets from the authenticated user. During seeding/tests there is no request, so no tenant is set and writes are explicit (`organization_id` passed in) or use `withoutGlobalScope('organization')`.
- `User` and `Role` intentionally do NOT use the global-scope trait (platform super-admin is org-less; roles are looked up during auth before tenant is resolved). They still carry `organization_id`.
- File storage namespacing per org (`storage/{org}/...`) and the frontend branding/subdomain work are Fase 3 — not in this plan.
- Login response should include `organization_id` (and later org branding) — wire this when Fase 3 touches `AuthController`; Fase 1 already scopes correctly from the user record.
