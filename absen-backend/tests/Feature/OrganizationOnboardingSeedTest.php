<?php
namespace Tests\Feature;

use App\Models\Organization;
use App\Models\Role;
use Database\Seeders\OrganizationRoleTemplateSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganizationOnboardingSeedTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeding_an_org_creates_its_default_roles(): void
    {
        // Permission master must exist first
        (new RolePermissionSeeder())->run();

        $org = Organization::create(['name' => 'Pemda Demo', 'code' => 'demo']);

        (new OrganizationRoleTemplateSeeder())->forOrganization($org->id);

        $roleNames = Role::where('organization_id', $org->id)->pluck('name')->sort()->values()->all();
        $this->assertEquals(['manager', 'org_admin', 'staff', 'supervisor'], $roleNames);
    }
}
