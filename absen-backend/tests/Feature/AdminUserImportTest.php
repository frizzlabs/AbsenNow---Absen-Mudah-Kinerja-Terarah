<?php
namespace Tests\Feature;

use App\Models\Organization;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\OrganizationRoleTemplateSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminUserImportTest extends TestCase
{
    use RefreshDatabase;

    public function test_imports_users_from_csv(): void
    {
        (new RolePermissionSeeder())->run();
        $org = Organization::create(['name' => 'A', 'code' => 'a']);
        (new OrganizationRoleTemplateSeeder())->forOrganization($org->id);
        $adminRole = Role::where('organization_id', $org->id)->where('name', 'org_admin')->first();
        $admin = User::create(['name' => 'Admin', 'email' => 'admin@a.test', 'password' => bcrypt('x'), 'organization_id' => $org->id, 'role_id' => $adminRole->id]);

        $csv = "name,email,department,position,role\n"
             . "Budi,budi@a.test,Dinas X,Staff,staff\n"
             . "Sari,sari@a.test,Dinas Y,Supervisor,supervisor\n";
        $file = UploadedFile::fake()->createWithContent('users.csv', $csv);

        Sanctum::actingAs($admin);
        $res = $this->postJson('/api/admin/users/import', ['file' => $file])->assertOk();

        $this->assertSame(2, $res->json('imported'));
        $this->assertDatabaseHas('users', ['email' => 'budi@a.test', 'organization_id' => $org->id]);
        $staffRole = Role::where('organization_id', $org->id)->where('name', 'staff')->first();
        $this->assertDatabaseHas('users', ['email' => 'budi@a.test', 'role_id' => $staffRole->id]);
    }
}
