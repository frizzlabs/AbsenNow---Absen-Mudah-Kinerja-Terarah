<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database (multi-tenant clean start).
     */
    public function run(): void
    {
        // Permission master + platform-level role.
        $this->call(RolePermissionSeeder::class);

        // Platform super-admin (organization-less, manages all Pemda).
        $platformRole = Role::whereNull('organization_id')->where(['name' => 'platform_superadmin'])->first();
        User::updateOrCreate(
            ['email' => 'vendor@absennow.id'],
            [
                'name' => 'Platform Admin',
                'password' => bcrypt('password'),
                'organization_id' => null,
                'role_id' => $platformRole?->id,
            ],
        );

        // Demo Pemda + its default roles + one org-admin (for testing onboarding).
        $demo = Organization::updateOrCreate(
            ['code' => 'demo'],
            [
                'name' => 'Pemda Demo',
                'is_active' => true,
                'settings' => ['instagram_username' => 'pemkot_demo']
            ],
        );
        (new OrganizationRoleTemplateSeeder())->forOrganization($demo->id);

        $orgAdminRole = Role::where(['organization_id' => $demo->id, 'name' => 'org_admin'])->first();
        User::updateOrCreate(
            ['email' => 'admin@demo.absennow.id'],
            [
                'name' => 'Admin Demo',
                'password' => bcrypt('password'),
                'organization_id' => $demo->id,
                'role_id' => $orgAdminRole?->id,
            ],
        );
    }
}
