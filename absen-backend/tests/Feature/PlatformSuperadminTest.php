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
        Office::withoutGlobalScope('organization')->create(['organization_id' => $orgA->id, 'name' => 'A-Office', 'latitude' => 0, 'longitude' => 0]);
        Office::withoutGlobalScope('organization')->create(['organization_id' => $orgB->id, 'name' => 'B-Office', 'latitude' => 0, 'longitude' => 0]);

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
