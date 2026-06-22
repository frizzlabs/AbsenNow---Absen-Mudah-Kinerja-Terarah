<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('dinas_luar_attendances') && !Schema::hasColumn('dinas_luar_attendances', 'organization_id')) {
            Schema::table('dinas_luar_attendances', function (Blueprint $table) {
                $table->foreignId('organization_id')->nullable()->after('id')
                    ->constrained('organizations')->nullOnDelete();
                $table->index('organization_id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('dinas_luar_attendances') && Schema::hasColumn('dinas_luar_attendances', 'organization_id')) {
            Schema::table('dinas_luar_attendances', function (Blueprint $table) {
                $table->dropConstrainedForeignId('organization_id');
            });
        }
    }
};
