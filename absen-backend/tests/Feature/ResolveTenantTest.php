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

        Office::withoutGlobalScope('organization')->create(['organization_id' => $orgA->id, 'name' => 'A-Office', 'latitude' => 0, 'longitude' => 0]);
        Office::withoutGlobalScope('organization')->create(['organization_id' => $orgB->id, 'name' => 'B-Office', 'latitude' => 0, 'longitude' => 0]);

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
