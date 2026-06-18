<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\RolePermission;
use App\Models\User;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    private array $actionLabels = [
        'view' => 'Lihat',
        'create' => 'Buat',
        'approve' => 'Setujui',
        'manage' => 'Kelola',
    ];

    // Modul = sama seperti di aplikasi mobile
    private array $modules = [
        'attendance'  => ['label' => 'Absensi',                    'actions' => ['view', 'create', 'approve', 'manage']],
        'activity'    => ['label' => 'Aktivitas',                  'actions' => ['view', 'create', 'manage']],
        'timesheet'   => ['label' => 'Timesheet',                  'actions' => ['view', 'create', 'approve', 'manage']],
        'leave'       => ['label' => 'Cuti',                       'actions' => ['view', 'create', 'approve', 'manage']],
        'overtime'    => ['label' => 'Lembur',                     'actions' => ['view', 'create', 'approve', 'manage']],
        'expense'     => ['label' => 'Reimbursement',              'actions' => ['view', 'create', 'approve', 'manage']],
        'permission'  => ['label' => 'Izin',                       'actions' => ['view', 'create', 'approve', 'manage']],
        'payslip'     => ['label' => 'Slip Gaji',                  'actions' => ['view', 'manage']],
        'performance' => ['label' => 'Performa',                   'actions' => ['view', 'manage']],
        'profile'     => ['label' => 'Profil',                     'actions' => ['view', 'manage']],
        'office'      => ['label' => 'Lokasi Kantor',              'actions' => ['view', 'manage']],
        'users'       => ['label' => 'Manajemen Pengguna & Role',  'actions' => ['view', 'manage']],
    ];

    public function run(): void
    {
        // 1) Seed semua permission per modul-aksi
        foreach ($this->modules as $module => $cfg) {
            foreach ($cfg['actions'] as $action) {
                RolePermission::updateOrCreate(
                    ['name' => "$module.$action"],
                    [
                        'module' => $module,
                        'action' => $action,
                        'module_label' => $cfg['label'],
                        'action_label' => $this->actionLabels[$action],
                    ]
                );
            }
        }

        $allNames = RolePermission::pluck('id', 'name'); // name => id

        // 2) Seed 4 role bawaan
        $roles = [
            'superadmin' => ['label' => 'Super Admin', 'description' => 'Akses penuh ke seluruh modul & pengaturan.'],
            'manager'    => ['label' => 'Manager',     'description' => 'Mengelola operasional & menyetujui pengajuan.'],
            'supervisor' => ['label' => 'Supervisor',  'description' => 'Menyetujui pengajuan tim & memantau aktivitas.'],
            'staff'      => ['label' => 'Staff',       'description' => 'Karyawan umum (admin, office boy, dll).'],
        ];
        foreach ($roles as $name => $data) {
            Role::updateOrCreate(['name' => $name], array_merge($data, ['is_system' => true]));
        }

        // 3) Default privilege tiap role
        $superadmin = $allNames->keys()->all(); // semua

        $manager = $allNames->keys()->filter(fn ($n) => $n !== 'users.manage')->values()->all();

        $supervisor = array_merge(
            $this->names('view'),
            ['attendance.create', 'activity.create', 'timesheet.create', 'leave.create', 'overtime.create', 'expense.create', 'permission.create'],
            ['attendance.approve', 'timesheet.approve', 'leave.approve', 'overtime.approve', 'expense.approve', 'permission.approve'],
            ['profile.manage']
        );

        $staff = array_merge(
            ['attendance.view', 'activity.view', 'timesheet.view', 'leave.view', 'overtime.view', 'expense.view', 'permission.view', 'payslip.view', 'performance.view', 'profile.view'],
            ['attendance.create', 'activity.create', 'timesheet.create', 'leave.create', 'overtime.create', 'expense.create', 'permission.create'],
            ['profile.manage']
        );

        $this->syncRole('superadmin', $superadmin, $allNames);
        $this->syncRole('manager', $manager, $allNames);
        $this->syncRole('supervisor', $supervisor, $allNames);
        $this->syncRole('staff', $staff, $allNames);

        // 4) Assign roles to seeded users
        $superRole     = Role::where('name', 'superadmin')->first();
        $managerRole   = Role::where('name', 'manager')->first();
        $supervisorRole = Role::where('name', 'supervisor')->first();
        $staffRole     = Role::where('name', 'staff')->first();

        // Super Admin
        $superAdminUser = User::where('email', 'ridwanprakoso0@gmail.com')->first();
        if ($superAdminUser && $superRole) {
            $superAdminUser->update(['role_id' => $superRole->id, 'position' => 'IT Administrator']);
        }

        // Test User sebagai Staff
        $testUser = User::where('email', 'wannnlala@gmail.com')->first();
        if ($testUser && $staffRole) {
            $testUser->update(['role_id' => $staffRole->id, 'position' => 'Senior Software Engineer']);
        }

        // Hanna Jenkins sebagai Manager
        $hanna = User::where('email', 'hanna@example.com')->first();
        if ($hanna && $managerRole) {
            $hanna->update(['role_id' => $managerRole->id, 'position' => 'General Manager']);
        }

        // Ridwan Prakoso sebagai Supervisor
        $michael = User::where('email', 'ridwanprakosoflutter@gmail.com')->first();
        if ($michael && $supervisorRole) {
            $michael->update(['role_id' => $supervisorRole->id, 'position' => 'Operations Supervisor']);
        }

        // David Miller sebagai Staff
        $david = User::where('email', 'david@example.com')->first();
        if ($david && $staffRole) {
            $david->update(['role_id' => $staffRole->id, 'position' => 'Senior Developer']);
        }

        // Emma Wilson sebagai Staff
        $emma = User::where('email', 'emma@example.com')->first();
        if ($emma && $staffRole) {
            $emma->update(['role_id' => $staffRole->id, 'position' => 'Office Administrator']);
        }
    }

    /** Semua permission dengan action tertentu. */
    private function names(string $action): array
    {
        $out = [];
        foreach ($this->modules as $module => $cfg) {
            if (in_array($action, $cfg['actions'])) {
                $out[] = "$module.$action";
            }
        }
        return $out;
    }

    private function syncRole(string $roleName, array $permNames, $allNames): void
    {
        $role = Role::where('name', $roleName)->first();
        if (!$role) {
            return;
        }
        $ids = collect($permNames)
            ->unique()
            ->map(fn ($n) => $allNames[$n] ?? null)
            ->filter()
            ->values()
            ->all();
        $role->permissions()->sync($ids);
    }
}
