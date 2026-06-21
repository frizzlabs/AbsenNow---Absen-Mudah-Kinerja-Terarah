<?php
namespace Tests\Feature;

use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantBrandingTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_public_branding_by_code(): void
    {
        Organization::create(['name' => 'Pemda Tangerang', 'code' => 'tangerang', 'logo_url' => 'https://x/l.png']);

        $this->getJson('/api/tenant/tangerang')
            ->assertOk()
            ->assertJson(['name' => 'Pemda Tangerang', 'code' => 'tangerang', 'logo_url' => 'https://x/l.png']);
    }

    public function test_unknown_code_returns_404(): void
    {
        $this->getJson('/api/tenant/nope')->assertNotFound();
    }
}
