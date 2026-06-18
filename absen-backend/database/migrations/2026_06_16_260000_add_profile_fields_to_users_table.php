<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Employment / basic (read-only di UI)
            $table->string('employee_id')->nullable();
            $table->string('job_title')->nullable();
            $table->string('department')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('gender')->nullable();
            // Kontak (editable)
            $table->string('phone')->nullable();
            $table->string('personal_email')->nullable();
            $table->text('address')->nullable();
            // Kontak darurat (editable)
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_relationship')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            // Avatar
            $table->string('avatar_url')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'employee_id', 'job_title', 'department', 'date_of_birth', 'gender',
                'phone', 'personal_email', 'address',
                'emergency_contact_name', 'emergency_contact_relationship', 'emergency_contact_phone',
                'avatar_url',
            ]);
        });
    }
};
