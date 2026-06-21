<?php
namespace Tests\Feature;

use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganizationModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_organization_with_unique_code(): void
    {
        $org = Organization::create([
            'name' => 'Pemda Tangerang',
            'code' => 'tangerang',
        ]);

        $this->assertDatabaseHas('organizations', ['code' => 'tangerang']);
        $this->assertTrue($org->is_active);
    }
}
