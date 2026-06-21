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
