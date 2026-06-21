<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\RolePermission;
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
        // (a) Seed permission master (global catalog, dipakai semua org).
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

        // (b) Role level platform (organization_id = null), akses lintas-instansi.
        Role::updateOrCreate(
            ['organization_id' => null, 'name' => 'platform_superadmin'],
            ['label' => 'Platform Super Admin', 'description' => 'Vendor lintas-instansi.', 'is_system' => true],
        );
    }
}
