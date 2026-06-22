<?php
namespace Tests\Feature;

use App\Models\Office;
use App\Models\Organization;
use App\Models\User;
use App\Models\DinasLuar;
use App\Models\DinasLuarAttendance;
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

    public function test_dinas_luar_attendances_are_scoped_and_creates_are_stamped(): void
    {
        $org1 = Organization::create(['name' => 'Org 1', 'code' => 'o1']);
        $org2 = Organization::create(['name' => 'Org 2', 'code' => 'o2']);
        $ctx = app(TenantContext::class);

        // Setup base data (User, DinasLuar)
        $user1 = User::create(['name' => 'U1', 'email' => 'u1@o1.test', 'password' => bcrypt('x'), 'organization_id' => $org1->id]);
        $user2 = User::create(['name' => 'U2', 'email' => 'u2@o2.test', 'password' => bcrypt('x'), 'organization_id' => $org2->id]);
        
        $dl1 = DinasLuar::create(['user_id' => $user1->id, 'location_name' => 'L1', 'latitude' => 0, 'longitude' => 0, 'start_datetime' => now(), 'end_datetime' => now()->addHour(), 'work_details' => 'D1', 'organization_id' => $org1->id]);
        $dl2 = DinasLuar::create(['user_id' => $user2->id, 'location_name' => 'L2', 'latitude' => 0, 'longitude' => 0, 'start_datetime' => now(), 'end_datetime' => now()->addHour(), 'work_details' => 'D2', 'organization_id' => $org2->id]);

        // Org 1 context
        $ctx->set($org1->id);
        $da1 = DinasLuarAttendance::create([
            'dinas_luar_id' => $dl1->id,
            'user_id' => $user1->id,
            'latitude' => 0,
            'longitude' => 0,
            'geofence_valid' => true,
            'work_report' => 'Report 1',
        ]);
        $this->assertSame($org1->id, $da1->organization_id);

        // Org 2 context: only org-2 rows are visible
        $ctx->set($org2->id);
        DinasLuarAttendance::create([
            'dinas_luar_id' => $dl2->id,
            'user_id' => $user2->id,
            'latitude' => 0,
            'longitude' => 0,
            'geofence_valid' => true,
            'work_report' => 'Report 2',
        ]);
        $this->assertSame(['Report 2'], DinasLuarAttendance::pluck('work_report')->all());

        // Back to org 1
        $ctx->set($org1->id);
        $this->assertSame(['Report 1'], DinasLuarAttendance::pluck('work_report')->all());
    }
}
