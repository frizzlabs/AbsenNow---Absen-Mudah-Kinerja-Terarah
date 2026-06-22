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
