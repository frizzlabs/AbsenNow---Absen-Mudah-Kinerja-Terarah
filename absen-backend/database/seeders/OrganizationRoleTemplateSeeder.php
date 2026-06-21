<?php
namespace Database\Seeders;

use App\Models\Role;
use App\Models\RolePermission;
use Illuminate\Database\Seeder;

class OrganizationRoleTemplateSeeder extends Seeder
{
    /** Seed the 4 default roles for a single organization and sync their permissions. */
    public function forOrganization(int $organizationId): void
    {
        $all = RolePermission::pluck('id', 'name'); // name => id

        $roles = [
            'org_admin'  => ['label' => 'Admin Instansi', 'description' => 'Mengelola seluruh modul instansi ini.', 'perms' => $all->keys()->all()],
            'manager'    => ['label' => 'Manager',         'description' => 'Operasional & persetujuan.', 'perms' => $all->keys()->filter(fn ($n) => $n !== 'users.manage')->values()->all()],
            'supervisor' => ['label' => 'Supervisor',      'description' => 'Persetujuan tim.', 'perms' => $this->supervisorPerms()],
            'staff'      => ['label' => 'Staff',           'description' => 'Karyawan umum.', 'perms' => $this->staffPerms()],
        ];

        foreach ($roles as $name => $data) {
            $role = Role::updateOrCreate(
                ['organization_id' => $organizationId, 'name' => $name],
                ['label' => $data['label'], 'description' => $data['description'], 'is_system' => true],
            );
            $ids = collect($data['perms'])->map(fn ($n) => $all[$n] ?? null)->filter()->values()->all();
            $role->permissions()->sync($ids);
        }
    }

    private function supervisorPerms(): array
    {
        return array_merge(
            ['attendance.view', 'activity.view', 'timesheet.view', 'leave.view', 'overtime.view', 'expense.view', 'permission.view', 'payslip.view', 'performance.view', 'profile.view', 'office.view', 'users.view'],
            ['attendance.create', 'activity.create', 'timesheet.create', 'leave.create', 'overtime.create', 'expense.create', 'permission.create'],
            ['attendance.approve', 'timesheet.approve', 'leave.approve', 'overtime.approve', 'expense.approve', 'permission.approve'],
            ['profile.manage'],
        );
    }

    private function staffPerms(): array
    {
        return array_merge(
            ['attendance.view', 'activity.view', 'timesheet.view', 'leave.view', 'overtime.view', 'expense.view', 'permission.view', 'payslip.view', 'performance.view', 'profile.view'],
            ['attendance.create', 'activity.create', 'timesheet.create', 'leave.create', 'overtime.create', 'expense.create', 'permission.create'],
            ['profile.manage'],
        );
    }
}
