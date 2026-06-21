<?php
namespace Tests\Feature;

use App\Models\Organization;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_clean_seed_creates_platform_admin_and_demo_org(): void
    {
        $this->seed(DatabaseSeeder::class);

        // One platform super-admin, org-less
        $platform = User::whereNull('organization_id')->get();
        $this->assertCount(1, $platform);
        $this->assertSame('vendor@absennow.id', $platform->first()->email);
        $this->assertTrue($platform->first()->isPlatformSuperadmin());

        // Demo org with its 4 default roles and one org-admin
        $demo = Organization::where('code', 'demo')->first();
        $this->assertNotNull($demo);
        $this->assertCount(4, Role::where('organization_id', $demo->id)->get());
        $this->assertDatabaseHas('users', ['email' => 'admin@demo.absennow.id', 'organization_id' => $demo->id]);
    }
}
