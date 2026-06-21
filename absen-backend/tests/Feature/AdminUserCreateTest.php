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
