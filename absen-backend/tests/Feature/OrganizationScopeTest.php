<?php
namespace Tests\Feature;

use App\Models\Office;
use App\Models\Organization;
use App\Support\TenantContext;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganizationScopeTest extends TestCase
{
    use RefreshDatabase;

    public function test_reads_are_scoped_and_creates_are_stamped(): void
    {
        $org1 = Organization::create(['name' => 'Org 1', 'code' => 'o1']);
        $org2 = Organization::create(['name' => 'Org 2', 'code' => 'o2']);
        $ctx = app(TenantContext::class);

        // Org 1 context: create an office, it gets stamped with org 1
        $ctx->set($org1->id);
        $a = Office::create(['name' => 'Kantor A', 'latitude' => 0, 'longitude' => 0]);
        $this->assertSame($org1->id, $a->organization_id);

        // Org 2 context: only org-2 rows are visible
        $ctx->set($org2->id);
        Office::create(['name' => 'Kantor B', 'latitude' => 0, 'longitude' => 0]);
        $this->assertSame(['Kantor B'], Office::pluck('name')->all());

        // Back to org 1
        $ctx->set($org1->id);
        $this->assertSame(['Kantor A'], Office::pluck('name')->all());

        // No tenant => no scoping (platform super-admin / seeding)
        $ctx->clear();
        $this->assertCount(2, Office::all());
    }
}
