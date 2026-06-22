# Multi-Tenant Fase 3 (Web Subdomain + Branding) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (frontend is verified manually in-browser). Steps use checkbox (`- [ ]`) syntax.

**Goal:** On web, resolve the active Pemda from the subdomain and show its branding (name + logo) on the login screen; after login, show the org branding in the desktop sidebar. Auth responses carry the user's organization.

**Architecture:** Two branding sources. (1) **Pre-login** (login screen) — `TenantService` resolves a tenant `code` from the subdomain (with a dev fallback) and calls the existing public `GET /tenant/{code}` for name/logo. (2) **Post-login** (sidebar/header) — `/me/permissions` now returns the logged-in user's `organization`, which `RoleService` caches; the sidebar shows it. UI matches existing styles (login `logo-wrapper-small`, sidebar `nav-brand`).

**Tech Stack:** Laravel 13 + Sanctum (backend), Angular/Ionic standalone (frontend), PHPUnit 12.

---

## Task 1: `/me/permissions` returns organization (backend, TDD)

**Files:**
- Modify: `absen-backend/app/Http/Controllers/Api/AdminUserController.php` (`me`)
- Modify: `absen-backend/app/Http/Controllers/Api/AuthController.php` (eager-load org on auth user responses)
- Test: `absen-backend/tests/Feature/MeOrganizationTest.php`

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

class MeOrganizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_me_includes_organization_branding(): void
    {
        (new RolePermissionSeeder())->run();
        $org = Organization::create(['name' => 'Pemda Tangerang', 'code' => 'tangerang', 'logo_url' => 'https://x/l.png']);
        (new OrganizationRoleTemplateSeeder())->forOrganization($org->id);
        $role = Role::where('organization_id', $org->id)->where('name', 'staff')->first();
        $user = User::create(['name' => 'U', 'email' => 'u@t.test', 'password' => bcrypt('x'), 'organization_id' => $org->id, 'role_id' => $role->id]);

        Sanctum::actingAs($user);

        $this->getJson('/api/me/permissions')
            ->assertOk()
            ->assertJsonPath('organization.code', 'tangerang')
            ->assertJsonPath('organization.name', 'Pemda Tangerang')
            ->assertJsonPath('organization.logo_url', 'https://x/l.png');
    }

    public function test_platform_admin_has_null_organization(): void
    {
        (new RolePermissionSeeder())->run();
        $role = Role::whereNull('organization_id')->where('name', 'platform_superadmin')->first();
        $user = User::create(['name' => 'V', 'email' => 'v@x.test', 'password' => bcrypt('x'), 'organization_id' => null, 'role_id' => $role->id]);

        Sanctum::actingAs($user);

        $this->getJson('/api/me/permissions')->assertOk()->assertJsonPath('organization', null);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd absen-backend && php artisan test --filter=MeOrganizationTest`
Expected: FAIL — `organization` key missing.

- [ ] **Step 3: Add organization to `AdminUserController@me`**

Replace the `me` method body's response with one that also loads + returns organization:

```php
public function me(Request $request)
{
    $user = $request->user()->load('role', 'organization');
    return response()->json([
        'role' => $user->role ? [
            'id' => $user->role->id,
            'name' => $user->role->name,
            'label' => $user->role->label,
        ] : null,
        'position' => $user->position,
        'permissions' => $user->permissionNames(),
        'organization' => $user->organization ? [
            'id' => $user->organization->id,
            'name' => $user->organization->name,
            'code' => $user->organization->code,
            'logo_url' => $user->organization->logo_url,
        ] : null,
    ]);
}
```

- [ ] **Step 4: Eager-load organization on auth responses**

In `AuthController.php`, for each token-issuing response that returns `'user' => $user` (register ~line 36, verifyOtp ~line 138, verifyPin ~line 315), change to `'user' => $user->load('organization')`.

- [ ] **Step 5: Run test to verify it passes**

Run: `cd absen-backend && php artisan test --filter=MeOrganizationTest`
Expected: PASS.

- [ ] **Step 6: Run full suite + commit**

```bash
cd absen-backend && php artisan test
git add absen-backend/app/Http/Controllers/Api/AdminUserController.php absen-backend/app/Http/Controllers/Api/AuthController.php absen-backend/tests/Feature/MeOrganizationTest.php
git commit -m "feat(tenancy): expose organization on /me/permissions and auth responses"
```

---

## Task 2: TenantService — resolve tenant code + fetch branding (frontend)

**Files:**
- Create: `src/app/core/services/tenant.service.ts`
- Test: manual (browser)

Resolution order: explicit `?tenant=<code>` query (dev) → first subdomain label (prod, skipping `localhost`/`www`/IP) → cached `localStorage 'tenant_code'`. Fetches `GET /tenant/{code}` and caches branding in `localStorage 'tenant_branding'`.

- [ ] **Step 1: Create the service**

```ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TenantBranding { name: string; code: string; logo_url: string | null; }

@Injectable({ providedIn: 'root' })
export class TenantService {
  private apiUrl = environment.apiUrl;
  branding$ = new BehaviorSubject<TenantBranding | null>(this.cached());

  constructor(private http: HttpClient) {}

  private cached(): TenantBranding | null {
    try { return JSON.parse(localStorage.getItem('tenant_branding') || 'null'); } catch { return null; }
  }

  /** Resolve the tenant code from query param, subdomain, or cache. */
  resolveCode(): string | null {
    const q = new URLSearchParams(window.location.search).get('tenant');
    if (q) { localStorage.setItem('tenant_code', q); return q; }

    const host = window.location.hostname; // e.g. tangerang.absennow.id
    const parts = host.split('.');
    const skip = ['localhost', 'www', '127', '0'];
    if (parts.length >= 3 && !skip.includes(parts[0])) {
      localStorage.setItem('tenant_code', parts[0]);
      return parts[0];
    }
    return localStorage.getItem('tenant_code');
  }

  /** Fetch + cache branding for the resolved tenant (call once at app/login start). */
  load(): void {
    const code = this.resolveCode();
    if (!code) { this.branding$.next(null); return; }
    this.http.get<TenantBranding>(`${this.apiUrl}/tenant/${code}`).subscribe({
      next: (b) => { localStorage.setItem('tenant_branding', JSON.stringify(b)); this.branding$.next(b); },
      error: () => { this.branding$.next(this.cached()); },
    });
  }

  current(): TenantBranding | null { return this.branding$.value; }
}
```

- [ ] **Step 2: Manual check**

Run the app, open `http://localhost:8100/auth/login?tenant=demo`. In devtools console: `localStorage.getItem('tenant_branding')` should hold the demo org JSON after Task 3 wires the call. (Wiring happens in Task 3.)

- [ ] **Step 3: Commit**

```bash
git add src/app/core/services/tenant.service.ts
git commit -m "feat(tenancy): TenantService resolves tenant code + branding (web)"
```

---

## Task 3: Login screen branding (frontend, match existing style)

**Files:**
- Modify: `src/app/features/auth/login/login.page.ts`
- Modify: `src/app/features/auth/login/login.page.html`
- Test: manual (browser)

Show the Pemda logo + name when a tenant is resolved; otherwise keep the default "K" logo + "Welcome back". Reuse the existing `logo-wrapper-small` / `welcome-*` classes for consistency.

- [ ] **Step 1: Wire TenantService into the login page**

In `login.page.ts`, inject `TenantService`, add a `branding` field, and load on init:

```ts
import { TenantService, TenantBranding } from '../../../core/services/tenant.service';
// ...
export class LoginPage implements OnInit {
  // ...existing fields...
  branding: TenantBranding | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController,
    private tenant: TenantService,
  ) {}

  ngOnInit() {
    this.tenant.load();
    this.tenant.branding$.subscribe((b) => (this.branding = b));
  }
```

- [ ] **Step 2: Show branding in the template**

In `login.page.html`, replace the `header-section` block with a branded variant (keeps existing classes; only swaps logo content + title when `branding` is present):

```html
<div class="header-section">
  <div class="logo-wrapper-small">
    <div class="logo-bg-1"></div>
    <div class="logo-bg-2"></div>
    <div class="logo">
      <img *ngIf="branding?.logo_url" [src]="branding!.logo_url" alt="logo" class="logo-img" />
      <span *ngIf="!branding?.logo_url" class="logo-text">{{ branding ? branding.name.charAt(0) : 'K' }}</span>
    </div>
  </div>

  <h1 class="text-h4 welcome-title">Welcome back</h1>
  <p class="text-body-medium-regular welcome-subtitle">
    {{ branding ? 'Masuk ke ' + branding.name : 'Please enter your details to sign in.' }}
  </p>
</div>
```

- [ ] **Step 3: Add the logo-img style**

In `login.page.scss`, inside `.logo-wrapper-small .logo`, add an image rule:

```scss
.logo-wrapper-small .logo .logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: var(--radius-md);
}
```

- [ ] **Step 4: Manual verify**

Open `http://localhost:8100/auth/login?tenant=demo` → logo badge shows "P" (Pemda Demo) and subtitle "Masuk ke Pemda Demo". Open `/auth/login` (no tenant) → default "K" + "Please enter your details to sign in." Both must look consistent with the current design.

- [ ] **Step 5: Commit**

```bash
git add src/app/features/auth/login/login.page.ts src/app/features/auth/login/login.page.html src/app/features/auth/login/login.page.scss
git commit -m "feat(tenancy): show tenant branding on login screen"
```

---

## Task 4: Sidebar/header org branding after login (frontend)

**Files:**
- Modify: `src/app/core/services/role.service.ts` (cache organization from `/me/permissions`)
- Modify: `src/app/shared/components/bottom-nav/bottom-nav.component.ts` + `.html`
- Test: manual (browser)

- [ ] **Step 1: Cache organization in RoleService**

In `role.service.ts` `loadMyPermissions()` `tap`, also store org:

```ts
this.myPermissions = res?.permissions || [];
this.myRole = res?.role || null;
localStorage.setItem('my_org', JSON.stringify(res?.organization || null));
```

Add a getter:

```ts
get organization(): any {
  try { return JSON.parse(localStorage.getItem('my_org') || 'null'); } catch { return null; }
}
```

And clear it in `clearCache()`: `localStorage.removeItem('my_org');`

- [ ] **Step 2: Show org name/logo in the sidebar brand**

In `bottom-nav.component.ts`, inject `RoleService` and expose `org`:

```ts
constructor(private router: Router, public roleService: RoleService) {}
get org() { return this.roleService.organization; }
```

In `bottom-nav.component.html`, update `.nav-brand` to prefer the org (fallback to AbsenNow):

```html
<div class="nav-brand">
  <div class="nav-brand-logo">
    <img *ngIf="org?.logo_url" [src]="org.logo_url" alt="logo" />
    <span *ngIf="!org?.logo_url">{{ (org?.name || 'AbsenNow').charAt(0) }}</span>
  </div>
  <span class="nav-brand-name">{{ org?.name || 'AbsenNow' }}</span>
</div>
```

- [ ] **Step 3: Style the brand logo image**

In `bottom-nav.component.scss`, inside the desktop `.nav-brand .nav-brand-logo`, ensure an image fits:

```scss
img { width: 100%; height: 100%; object-fit: contain; border-radius: 9px; }
```

- [ ] **Step 4: Manual verify**

Log in as `admin@demo.absennow.id` (after `migrate:fresh --seed`), open the app on desktop (≥1024px) → sidebar shows "Pemda Demo" (its logo if set, else "P"). Without org (platform admin) → falls back to "AbsenNow".

- [ ] **Step 5: Commit**

```bash
git add src/app/core/services/role.service.ts src/app/shared/components/bottom-nav/bottom-nav.component.ts src/app/shared/components/bottom-nav/bottom-nav.component.html src/app/shared/components/bottom-nav/bottom-nav.component.scss
git commit -m "feat(tenancy): show org branding in desktop sidebar after login"
```

---

## Final verification

- [ ] Backend suite green: `cd absen-backend && php artisan test`
- [ ] Login `?tenant=demo` shows Pemda Demo branding; plain login shows default.
- [ ] After login as a Pemda user, desktop sidebar shows the Pemda name/logo.

## Notes
- Dev has no real subdomain, so `?tenant=<code>` is the test path; in prod, `tangerang.absennow.id` resolves automatically. Requires the dev DB to be seeded (`migrate:fresh --seed`) so `GET /tenant/demo` returns data.
- Login response `organization_id` was already on the user model since Fase 1; this phase surfaces the full org object for branding.
