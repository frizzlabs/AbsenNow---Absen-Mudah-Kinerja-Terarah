<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Office;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed Test User
        $testUser = User::firstOrCreate(
            ['email' => 'wannnlala@gmail.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
            ]
        );

        // Seed Super Admin User
        $superAdmin = User::firstOrCreate(
            ['email' => 'ridwanprakoso0@gmail.com'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('password'),
            ]
        );

        // Lengkapi data profil Test User (agar bisa ditampilkan & diedit di /profile)
        $testUser->update([
            'employee_id' => 'EMP-2024-889',
            'job_title' => 'Senior Software Engineer',
            'department' => 'Engineering',
            'date_of_birth' => '1992-10-14',
            'gender' => 'Laki-laki',
            'phone' => '+62 812-3456-7890',
            'personal_email' => 'test.user@gmail.com',
            'address' => "Jl. Pajajaran No. 42, Bogor Tengah\nKota Bogor, Jawa Barat 16121",
            'emergency_contact_name' => 'Hanna Jenkins',
            'emergency_contact_relationship' => 'Pasangan',
            'emergency_contact_phone' => '+62 813-9876-5432',
        ]);

        // Seed Delegation Users (Hanna Jenkins, Michael Chen, David Miller, Emma Wilson)
        $hanna = User::firstOrCreate(
            ['email' => 'hanna@example.com'],
            [
                'name' => 'Hanna Jenkins',
                'password' => bcrypt('password'),
            ]
        );
        $michael = User::firstOrCreate(
            ['email' => 'ridwanprakosoflutter@gmail.com'],
            [
                'name' => 'Ridwan Prakoso',
                'password' => bcrypt('password'),
            ]
        );
        $david = User::firstOrCreate(
            ['email' => 'david@example.com'],
            [
                'name' => 'David Miller',
                'password' => bcrypt('password'),
            ]
        );
        $emma = User::firstOrCreate(
            ['email' => 'emma@example.com'],
            [
                'name' => 'Emma Wilson',
                'password' => bcrypt('password'),
            ]
        );

        // Seed default Leave Balances for Test User
        \App\Models\LeaveBalance::firstOrCreate(
            ['user_id' => $testUser->id, 'leave_type' => 'annual'],
            ['allocated' => 20, 'used' => 8]
        );
        \App\Models\LeaveBalance::firstOrCreate(
            ['user_id' => $testUser->id, 'leave_type' => 'sick'],
            ['allocated' => 7, 'used' => 2]
        );

        // Seed Sample Leave Requests for Test User
        \App\Models\Leave::firstOrCreate(
            [
                'user_id' => $testUser->id,
                'leave_type' => 'annual',
                'start_date' => '2026-02-24',
                'end_date' => '2026-02-25',
            ],
            [
                'delegate_user_id' => $hanna->id,
                'reason' => 'Family vacation and personal errands.',
                'status' => 'pending',
                'total_days' => 2,
            ]
        );
        \App\Models\Leave::firstOrCreate(
            [
                'user_id' => $testUser->id,
                'leave_type' => 'remote',
                'start_date' => '2025-11-01',
                'end_date' => '2025-11-01',
            ],
            [
                'delegate_user_id' => $michael->id,
                'reason' => 'Working remotely due to home renovations.',
                'status' => 'approved',
                'total_days' => 1,
            ]
        );

        // Seed Sample Expense Reimbursements for Test User
        \App\Models\Expense::firstOrCreate(
            [
                'user_id' => $testUser->id,
                'merchant' => 'Uber to Airport',
                'expense_date' => '2026-10-24',
            ],
            [
                'category' => 'travel',
                'amount' => 45.00,
                'notes' => 'Ride to airport for client meeting.',
                'status' => 'pending',
            ]
        );
        \App\Models\Expense::firstOrCreate(
            [
                'user_id' => $testUser->id,
                'merchant' => 'Flight to NYC',
                'expense_date' => '2026-10-24',
            ],
            [
                'category' => 'travel',
                'amount' => 450.00,
                'notes' => 'Flight tickets for sales trip.',
                'status' => 'approved',
            ]
        );
        \App\Models\Expense::firstOrCreate(
            [
                'user_id' => $testUser->id,
                'merchant' => 'Client Lunch',
                'expense_date' => '2026-10-22',
            ],
            [
                'category' => 'meals',
                'amount' => 125.00,
                'notes' => 'Client lunch with ABC Corp.',
                'status' => 'approved',
            ]
        );
        \App\Models\Expense::firstOrCreate(
            [
                'user_id' => $testUser->id,
                'merchant' => 'Client Dinner',
                'expense_date' => '2026-10-22',
            ],
            [
                'category' => 'meals',
                'amount' => 250.00,
                'notes' => 'Dinner with prospects.',
                'status' => 'rejected',
            ]
        );

        // Seed Sample Permissions for Test User
        \App\Models\Permission::firstOrCreate(
            [
                'user_id' => $testUser->id,
                'title' => "Doctor's Appointment",
                'permission_date' => '2026-02-24',
            ],
            [
                'category' => 'personal',
                'start_time' => '09:00:00',
                'end_time' => '11:00:00',
                'duration_hours' => 2.00,
                'notes' => 'Dental checkup at medical center.',
                'status' => 'pending',
            ]
        );
        \App\Models\Permission::firstOrCreate(
            [
                'user_id' => $testUser->id,
                'title' => 'School Pick-up',
                'permission_date' => '2026-02-18',
            ],
            [
                'category' => 'family',
                'start_time' => '15:00:00',
                'end_time' => '16:30:00',
                'duration_hours' => 1.50,
                'notes' => 'Picking up kids due to school emergency.',
                'status' => 'approved',
            ]
        );
        \App\Models\Permission::firstOrCreate(
            [
                'user_id' => $testUser->id,
                'title' => 'Internet Maintenance',
                'permission_date' => '2026-01-12',
            ],
            [
                'category' => 'emergency',
                'start_time' => '08:00:00',
                'end_time' => '12:00:00',
                'duration_hours' => 4.00,
                'notes' => 'ISP maintenance at home.',
                'status' => 'approved',
            ]
        );
        \App\Models\Permission::firstOrCreate(
            [
                'user_id' => $testUser->id,
                'title' => 'Brief Personal Matter',
                'permission_date' => '2026-01-05',
            ],
            [
                'category' => 'other',
                'start_time' => '10:00:00',
                'end_time' => '11:00:00',
                'duration_hours' => 1.00,
                'notes' => 'Urgent bank business.',
                'status' => 'rejected',
            ]
        );

        // Seed Sample Overtime Requests for Test User
        \App\Models\Overtime::firstOrCreate(
            [
                'user_id' => $testUser->id,
                'title' => 'Quarterly Report Prep',
                'overtime_date' => '2026-06-08',
            ],
            [
                'start_time' => '18:00:00',
                'end_time' => '21:00:00',
                'duration_hours' => 3.00,
                'reason' => 'Finishing Q2 financial reports ahead of the board meeting.',
                'status' => 'pending',
            ]
        );
        \App\Models\Overtime::firstOrCreate(
            [
                'user_id' => $testUser->id,
                'title' => 'Server Migration Support',
                'overtime_date' => '2026-06-04',
            ],
            [
                'start_time' => '17:30:00',
                'end_time' => '20:30:00',
                'duration_hours' => 3.00,
                'reason' => 'On-call support during production server migration.',
                'status' => 'approved',
            ]
        );
        \App\Models\Overtime::firstOrCreate(
            [
                'user_id' => $testUser->id,
                'title' => 'Inventory Stock Audit',
                'overtime_date' => '2026-06-02',
            ],
            [
                'start_time' => '18:00:00',
                'end_time' => '22:30:00',
                'duration_hours' => 4.50,
                'reason' => 'End-of-quarter inventory reconciliation.',
                'status' => 'approved',
            ]
        );
        \App\Models\Overtime::firstOrCreate(
            [
                'user_id' => $testUser->id,
                'title' => 'Personal Projects',
                'overtime_date' => '2026-05-29',
            ],
            [
                'start_time' => '19:00:00',
                'end_time' => '21:00:00',
                'duration_hours' => 2.00,
                'reason' => 'Unauthorized after-hours work.',
                'status' => 'rejected',
            ]
        );

        // Seed Sample Activity Logs for Test User (current week, not yet submitted)
        $activitySeed = [
            ['title' => 'Frontend Development', 'project' => 'Karajo HRIS Internal Tools', 'project_color' => 'primary', 'category' => 'development', 'activity_date' => '2026-06-15', 'start_time' => '13:00:00', 'end_time' => '16:15:00', 'description' => 'Built the overtime request wizard and wired it to the API.'],
            ['title' => 'Client Meeting', 'project' => 'Project Alpha', 'project_color' => 'purple', 'category' => 'meeting', 'activity_date' => '2026-06-15', 'start_time' => '09:00:00', 'end_time' => '10:00:00', 'description' => 'Weekly sync with the client on roadmap priorities.'],
            ['title' => 'Sprint Planning', 'project' => 'All Hands', 'project_color' => 'warning', 'category' => 'meeting', 'activity_date' => '2026-06-16', 'start_time' => '13:00:00', 'end_time' => '16:30:00', 'description' => 'Planned the next two-week sprint with the team.'],
            ['title' => 'Design System Update', 'project' => 'Internal Tools', 'project_color' => 'primary', 'category' => 'design', 'activity_date' => '2026-06-16', 'start_time' => '10:00:00', 'end_time' => '12:15:00', 'description' => 'Refined shared components and spacing tokens.'],
            ['title' => 'Code Review & Merge', 'project' => 'Project Y', 'project_color' => 'purple', 'category' => 'qa', 'activity_date' => '2026-06-17', 'start_time' => '09:00:00', 'end_time' => '09:45:00', 'description' => 'Reviewed and merged outstanding pull requests.'],
        ];
        foreach ($activitySeed as $a) {
            $start = \Illuminate\Support\Carbon::parse($a['start_time']);
            $end = \Illuminate\Support\Carbon::parse($a['end_time']);
            \App\Models\Activity::firstOrCreate(
                ['user_id' => $testUser->id, 'title' => $a['title'], 'activity_date' => $a['activity_date']],
                array_merge($a, ['duration_minutes' => $start->diffInMinutes($end)])
            );
        }

        // Seed a submitted & approved Timesheet for last week (Jun 7 - Jun 13)
        $approvedTs = \App\Models\Timesheet::firstOrCreate(
            ['user_id' => $testUser->id, 'week_start_date' => '2026-06-07'],
            [
                'week_end_date' => '2026-06-13',
                'total_minutes' => 2520, // 42h
                'activities_count' => 12,
                'status' => 'approved',
                'reviewer_name' => 'Alex Johnson',
                'submitted_at' => '2026-06-13 21:00:00',
                'reviewed_at' => '2026-06-14 09:20:00',
            ]
        );
        if ($approvedTs->events()->count() === 0) {
            $approvedTs->events()->createMany([
                ['status' => 'Submitted', 'actor_name' => 'Test User', 'note' => 'Timesheet submitted for approval.', 'created_at' => '2026-06-13 21:00:00', 'updated_at' => '2026-06-13 21:00:00'],
                ['status' => 'HR Review', 'actor_name' => 'Alex Johnson', 'note' => 'Reviewed by HR.', 'created_at' => '2026-06-14 09:00:00', 'updated_at' => '2026-06-14 09:00:00'],
                ['status' => 'Approved', 'actor_name' => 'Alex Johnson', 'note' => 'Timesheet approved.', 'created_at' => '2026-06-14 09:20:00', 'updated_at' => '2026-06-14 09:20:00'],
            ]);
        }

        // Seed a Timesheet awaiting revision (Jun 14 - Jun 20, current week)
        $revisionTs = \App\Models\Timesheet::firstOrCreate(
            ['user_id' => $testUser->id, 'week_start_date' => '2026-05-31'],
            [
                'week_end_date' => '2026-06-06',
                'total_minutes' => 2430, // 40h 30m
                'activities_count' => 11,
                'status' => 'revision',
                'reviewer_name' => 'Alex Washington',
                'reviewer_note' => 'Please double-check the project assignment for Friday. The hours seem correct but the project code might be mismatched.',
                'submitted_at' => '2026-06-06 18:00:00',
                'reviewed_at' => '2026-06-07 09:42:00',
            ]
        );
        if ($revisionTs->events()->count() === 0) {
            $revisionTs->events()->createMany([
                ['status' => 'Submitted', 'actor_name' => 'Test User', 'note' => 'Timesheet submitted for approval.', 'created_at' => '2026-06-06 18:00:00', 'updated_at' => '2026-06-06 18:00:00'],
                ['status' => 'HR Review', 'actor_name' => 'Alex Washington', 'note' => 'Reviewed by HR.', 'created_at' => '2026-06-07 09:30:00', 'updated_at' => '2026-06-07 09:30:00'],
                ['status' => 'Revision Requested', 'actor_name' => 'Alex Washington', 'note' => 'Correction needed on Friday project assignment.', 'created_at' => '2026-06-07 09:42:00', 'updated_at' => '2026-06-07 09:42:00'],
            ]);
        }

        // Seed Sample Payslips for Test User (IDR, Bahasa Indonesia)
        $this->seedPayslip($testUser->id, 'Mei 2026', '2026-05-01', '2026-05-31', '2026-06-01');
        $this->seedPayslip($testUser->id, 'April 2026', '2026-04-01', '2026-04-30', '2026-05-01');
        $this->seedPayslip($testUser->id, 'Maret 2026', '2026-03-01', '2026-03-31', '2026-04-01');

        // Bonus Tahunan (tipe bonus, satu item)
        $bonus = \App\Models\Payslip::firstOrCreate(
            ['user_id' => $testUser->id, 'period_label' => 'Bonus Tahunan 2025'],
            [
                'period_start' => '2025-12-01',
                'period_end' => '2025-12-31',
                'type' => 'bonus',
                'gross_salary' => 15000000,
                'total_deductions' => 0,
                'net_salary' => 15000000,
                'status' => 'dibayar',
                'paid_date' => '2025-12-20',
                'bank_name' => 'Bank Central Asia',
                'bank_account_masked' => '****4582',
            ]
        );
        if ($bonus->items()->count() === 0) {
            $bonus->items()->create([
                'section' => 'gaji_pokok', 'title' => 'Bonus Tahunan', 'subtitle' => 'THR & bonus kinerja',
                'icon' => 'gift-outline', 'amount' => 15000000, 'is_deduction' => false,
            ]);
        }

        // Seed Performance (KPI + Feedback + Review) for Test User
        $this->seedPerformance($testUser->id, 'Q2 2026');

        // Seed Office
        // ============================================================
        // LOKASI KANTOR — EDIT 4 BARIS DI BAWAH INI, lalu jalankan:
        //   php artisan db:seed
        // Cara dapat koordinat: buka Google Maps, klik kanan di titik
        // kantor (mis. Alfamart) -> klik angka koordinat untuk menyalin.
        // ============================================================
        $officeName = 'Kantor Pusat';
        $officeLat = -6.200000;     // <- ganti dengan LATITUDE kantor kamu
        $officeLng = 106.816666;    // <- ganti dengan LONGITUDE kantor kamu
        $officeRadius = 100;        // <- radius geofence (meter)

        $office = Office::first();
        if ($office) {
            $office->update([
                'name' => $officeName,
                'latitude' => $officeLat,
                'longitude' => $officeLng,
                'radius_meters' => $officeRadius,
            ]);
        } else {
            Office::create([
                'name' => $officeName,
                'latitude' => $officeLat,
                'longitude' => $officeLng,
                'radius_meters' => $officeRadius,
            ]);
        }

        // Seed Roles & Permissions (RBAC)
        $this->call(RolePermissionSeeder::class);
    }

    /**
     * Buat satu slip gaji bulanan standar (IDR) beserta rincian itemnya.
     */
    private function seedPayslip(int $userId, string $label, string $start, string $end, string $paidDate): void
    {
        $items = [
            // Pendapatan
            ['section' => 'gaji_pokok', 'title' => 'Gaji Pokok', 'subtitle' => 'Gaji bulanan tetap', 'icon' => 'document-text-outline', 'amount' => 8500000, 'is_deduction' => false],
            ['section' => 'gaji_pokok', 'title' => 'Lembur', 'subtitle' => 'Upah lembur bulan ini', 'icon' => 'time-outline', 'amount' => 750000, 'is_deduction' => false],
            ['section' => 'gaji_pokok', 'title' => 'Tunjangan Jabatan', 'subtitle' => 'Tunjangan tetap', 'icon' => 'people-outline', 'amount' => 1500000, 'is_deduction' => false],
            ['section' => 'tunjangan', 'title' => 'Tunjangan Perumahan', 'subtitle' => 'Tunjangan tetap bulanan', 'icon' => 'home-outline', 'amount' => 2000000, 'is_deduction' => false],
            ['section' => 'tunjangan', 'title' => 'Tunjangan Transport', 'subtitle' => 'Tunjangan harian', 'icon' => 'car-outline', 'amount' => 600000, 'is_deduction' => false],
            ['section' => 'tunjangan', 'title' => 'Tunjangan Makan', 'subtitle' => 'Tunjangan harian', 'icon' => 'cafe-outline', 'amount' => 500000, 'is_deduction' => false],
            // Potongan
            ['section' => 'pajak_asuransi', 'title' => 'Asuransi Kesehatan', 'subtitle' => 'BPJS Kesehatan', 'icon' => 'shield-checkmark-outline', 'amount' => 400000, 'is_deduction' => true],
            ['section' => 'pajak_asuransi', 'title' => 'BPJS Ketenagakerjaan', 'subtitle' => 'Jaminan hari tua & pensiun', 'icon' => 'business-outline', 'amount' => 250000, 'is_deduction' => true],
            ['section' => 'pajak_asuransi', 'title' => 'Asuransi Jiwa', 'subtitle' => 'Polis kelompok', 'icon' => 'heart-circle-outline', 'amount' => 150000, 'is_deduction' => true],
            ['section' => 'potongan_lain', 'title' => 'PPh 21', 'subtitle' => 'Pajak penghasilan', 'icon' => 'business-outline', 'amount' => 850000, 'is_deduction' => true],
            ['section' => 'potongan_lain', 'title' => 'Dana Pensiun', 'subtitle' => 'Iuran pensiun', 'icon' => 'cash-outline', 'amount' => 300000, 'is_deduction' => true],
            ['section' => 'potongan_lain', 'title' => 'Iuran Serikat', 'subtitle' => 'Keanggotaan bulanan', 'icon' => 'people-outline', 'amount' => 50000, 'is_deduction' => true],
        ];

        $gross = 0;
        $deductions = 0;
        foreach ($items as $i) {
            if ($i['is_deduction']) {
                $deductions += $i['amount'];
            } else {
                $gross += $i['amount'];
            }
        }

        $payslip = \App\Models\Payslip::firstOrCreate(
            ['user_id' => $userId, 'period_label' => $label],
            [
                'period_start' => $start,
                'period_end' => $end,
                'type' => 'gaji',
                'gross_salary' => $gross,
                'total_deductions' => $deductions,
                'net_salary' => $gross - $deductions,
                'status' => 'dibayar',
                'paid_date' => $paidDate,
                'bank_name' => 'Bank Central Asia',
                'bank_account_masked' => '****4582',
            ]
        );

        if ($payslip->items()->count() === 0) {
            $payslip->items()->createMany($items);
        }
    }

    /**
     * Seed data performa (review, KPI + histori, feedback) untuk satu periode.
     */
    private function seedPerformance(int $userId, string $period): void
    {
        \App\Models\PerformanceReview::firstOrCreate(
            ['user_id' => $userId, 'period' => $period],
            ['overall_score' => 88, 'status_label' => 'Excellent', 'review_completion' => 90]
        );

        $kpis = [
            ['title' => 'Increase Sales Conversion', 'description' => 'Optimize the checkout flow to improve conversion rates by end of the quarter.', 'status' => 'completed', 'weight' => 20, 'target_label' => 'Target: 5.0%', 'current_label' => 'Current: 5.2%', 'achievement_percent' => 100, 'last_updated' => '2026-06-15', 'manager_note' => 'Excellent work on the checkout redesign. The new one-click payment integration significantly boosted our mobile conversion numbers ahead of schedule.'],
            ['title' => 'Team Training Completion', 'description' => 'Ensure 100% of the team completes the mandatory security compliance training.', 'status' => 'on_track', 'weight' => 15, 'target_label' => 'Target: 100%', 'current_label' => 'Current: 85%', 'achievement_percent' => 85, 'last_updated' => '2026-06-12', 'manager_note' => null],
            ['title' => 'Reduce Churn Rate', 'description' => 'Implement new retention strategies to lower monthly customer churn.', 'status' => 'at_risk', 'weight' => 25, 'target_label' => 'Target: < 2.0%', 'current_label' => 'Current: 2.8%', 'achievement_percent' => 60, 'last_updated' => '2026-06-10', 'manager_note' => 'Churn is trending above target. Let us schedule a retention strategy review next week.'],
            ['title' => 'Launch Mobile App v2', 'description' => 'Release the major update for iOS and Android platforms including dark mode.', 'status' => 'completed', 'weight' => 30, 'target_label' => 'Target: May 28', 'current_label' => 'Done: May 20', 'achievement_percent' => 100, 'last_updated' => '2026-05-20', 'manager_note' => 'Shipped ahead of schedule with great reviews.'],
            ['title' => 'Customer Feedback Score', 'description' => 'Maintain an average CSAT score above 4.5 throughout the quarter.', 'status' => 'on_track', 'weight' => 10, 'target_label' => 'Target: 4.5', 'current_label' => 'Current: 4.7', 'achievement_percent' => 100, 'last_updated' => '2026-06-14', 'manager_note' => null],
        ];

        foreach ($kpis as $k) {
            $kpi = \App\Models\Kpi::firstOrCreate(
                ['user_id' => $userId, 'period' => $period, 'title' => $k['title']],
                $k
            );
            if ($kpi->histories()->count() === 0 && $kpi->status === 'completed') {
                $kpi->histories()->createMany([
                    ['label' => $kpi->current_label, 'note' => 'Updated by System', 'event_date' => $kpi->last_updated, 'color' => 'green'],
                    ['label' => 'Mid-quarter checkpoint', 'note' => 'Updated by System', 'event_date' => '2026-05-28', 'color' => 'blue'],
                ]);
            }
        }

        $feedbacks = [
            ['reviewer_name' => 'Sarah Miller', 'reviewer_role' => 'Sales Director', 'type' => 'manager', 'category' => 'Leadership & Execution', 'rating' => 4.5, 'status' => 'pending', 'submitted_at' => '2026-06-15 14:30:00', 'summary' => 'Great job leading the Q2 retrospective. The team really appreciated your structured approach to the new conversion targets.', 'body' => "Sarah has shown exceptional leadership during the Q2 sales sprint. Her ability to rally the team around the new conversion targets was instrumental in our success. She effectively communicated the strategic importance of the checkout flow optimization, ensuring everyone understood their role.\n\nOne area for continued focus is cross-departmental collaboration earlier in the project lifecycle. While execution was flawless, involving the marketing team sooner could have amplified the launch impact even further.\n\nOverall, a fantastic quarter with tangible results. Keep pushing the boundaries on what our team can achieve."],
            ['reviewer_name' => 'David Chen', 'reviewer_role' => 'Product Designer', 'type' => 'peer', 'category' => 'Collaboration', 'rating' => 5.0, 'status' => 'acknowledged', 'submitted_at' => '2026-06-14 10:00:00', 'acknowledged_at' => '2026-06-14 12:00:00', 'summary' => 'Thanks for helping me debug the frontend component library. Your quick turnaround saved the release.', 'body' => 'Thanks for helping me debug the frontend component library. Your quick turnaround saved the release timeline and unblocked the whole design team.'],
            ['reviewer_name' => 'Elena Rodriguez', 'reviewer_role' => 'Marketing Lead', 'type' => 'peer', 'category' => 'Collaboration', 'rating' => 4.8, 'status' => 'acknowledged', 'submitted_at' => '2026-06-10 09:00:00', 'acknowledged_at' => '2026-06-10 15:00:00', 'summary' => 'I loved the collaboration on the new brand guidelines. You were very open to feedback and iterated quickly.', 'body' => 'I loved the collaboration on the new brand guidelines. You were very open to feedback and iterated quickly to align the product UI with the brand direction.'],
            ['reviewer_name' => 'James Wilson', 'reviewer_role' => 'VP of Engineering', 'type' => 'manager', 'category' => 'Technical Strategy', 'rating' => 4.0, 'status' => 'acknowledged', 'submitted_at' => '2026-06-05 16:00:00', 'acknowledged_at' => '2026-06-06 09:00:00', 'summary' => 'Please review the architecture proposal again. We need to consider scalability more carefully.', 'body' => 'Please review the architecture proposal again. I think we need to consider scalability more carefully before we commit to the new service boundaries.'],
            ['reviewer_name' => 'Priya Patel', 'reviewer_role' => 'Data Scientist', 'type' => 'peer', 'category' => 'Collaboration', 'rating' => 4.6, 'status' => 'acknowledged', 'submitted_at' => '2026-06-01 11:00:00', 'acknowledged_at' => '2026-06-01 13:00:00', 'summary' => 'Helpful insights during the data modeling workshop. Your questions helped clarify the requirements.', 'body' => 'Helpful insights during the data modeling workshop. Your questions helped clarify the requirements and tightened our feature definitions.'],
        ];

        foreach ($feedbacks as $f) {
            \App\Models\Feedback::firstOrCreate(
                ['user_id' => $userId, 'period' => $period, 'reviewer_name' => $f['reviewer_name'], 'submitted_at' => $f['submitted_at']],
                array_merge($f, ['period' => $period])
            );
        }
    }
}
