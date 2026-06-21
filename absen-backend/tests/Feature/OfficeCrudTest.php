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
