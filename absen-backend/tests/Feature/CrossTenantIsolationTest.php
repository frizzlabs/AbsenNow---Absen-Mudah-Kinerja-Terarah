<?php
namespace Tests\Feature;

use App\Models\AttendanceCorrection;
use App\Models\Organization;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\OrganizationRoleTemplateSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CrossTenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_supervisor_cannot_review_other_orgs_correction(): void
    {
        (new RolePermissionSeeder())->run();
        $orgA = Organization::create(['name' => 'A', 'code' => 'a']);
        $orgB = Organization::create(['name' => 'B', 'code' => 'b']);
        (new OrganizationRoleTemplateSeeder())->forOrganization($orgA->id);

        $supRole = Role::where('organization_id', $orgA->id)->where('name', 'supervisor')->first();
        $supA = User::create([
            'name' => 'Sup A', 'email' => 'sup@a.test', 'password' => bcrypt('x'),
            'organization_id' => $orgA->id, 'role_id' => $supRole->id,
        ]);

        // A staff member + correction owned by org B
        $staffB = User::create([
            'name' => 'Staff B', 'email' => 'staff@b.test', 'password' => bcrypt('x'),
            'organization_id' => $orgB->id,
        ]);
        $correction = AttendanceCorrection::withoutGlobalScope('organization')->create([
            'organization_id' => $orgB->id, 'user_id' => $staffB->id,
            'correction_date' => '2026-06-15', 'correction_type' => 'forgot_checkin',
            'justification' => 'cross tenant attempt that is long enough', 'status' => 'pending',
        ]);

        Sanctum::actingAs($supA);
        $this->putJson("/api/attendance/corrections/{$correction->id}/review", [
            'status' => 'approved',
        ])->assertNotFound();
    }
}
