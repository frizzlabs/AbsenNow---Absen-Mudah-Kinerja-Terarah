<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('attendance_corrections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('correction_date');
            $table->string('correction_type'); // forgot_checkin, forgot_checkout, gps_error, app_error, dinas_luar, other
            $table->time('proposed_checkin')->nullable();
            $table->time('proposed_checkout')->nullable();
            $table->time('original_checkin')->nullable();
            $table->time('original_checkout')->nullable();
            $table->text('justification');
            $table->string('evidence_path')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_corrections');
    }
};
