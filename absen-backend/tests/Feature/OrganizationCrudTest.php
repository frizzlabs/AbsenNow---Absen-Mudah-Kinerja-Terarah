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

    public function test_platform_admin_updates_org(): void
    {
        Sanctum::actingAs($this->platformAdmin());
        $org = Organization::create(['name' => 'Old', 'code' => 'old']);

        $this->putJson("/api/admin/organizations/{$org->id}", ['name' => 'New Name', 'is_active' => false])
            ->assertOk()
            ->assertJsonPath('organization.name', 'New Name');

        $this->assertDatabaseHas('organizations', ['id' => $org->id, 'name' => 'New Name', 'is_active' => false]);
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
