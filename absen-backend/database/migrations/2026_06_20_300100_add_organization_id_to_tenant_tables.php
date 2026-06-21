<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    private array $tables = [
        'users', 'offices', 'roles',
        'attendances', 'leaves', 'leave_balances', 'expenses', 'permissions',
        'overtimes', 'timesheets', 'timesheet_events', 'activities',
        'payslips', 'payslip_items', 'kpis', 'kpi_histories', 'feedbacks',
        'performance_reviews', 'attendance_corrections', 'dinas_luar', 'user_identities',
    ];

    public function up(): void
    {
        foreach ($this->tables as $name) {
            if (!Schema::hasTable($name) || Schema::hasColumn($name, 'organization_id')) {
                continue;
            }
            Schema::table($name, function (Blueprint $table) {
                $table->foreignId('organization_id')->nullable()->after('id')
                    ->constrained('organizations')->nullOnDelete();
                $table->index('organization_id');
            });
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $name) {
            if (!Schema::hasTable($name) || !Schema::hasColumn($name, 'organization_id')) {
                continue;
            }
            Schema::table($name, function (Blueprint $table) {
                $table->dropConstrainedForeignId('organization_id');
            });
        }
    }
};
