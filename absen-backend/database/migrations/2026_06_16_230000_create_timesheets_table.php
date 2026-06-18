<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('timesheets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('week_start_date');
            $table->date('week_end_date');
            $table->integer('total_minutes')->default(0);
            $table->integer('activities_count')->default(0);
            // draft | pending | approved | rejected | revision
            $table->string('status')->default('pending');
            $table->string('reviewer_name')->nullable();
            $table->text('reviewer_note')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'week_start_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('timesheets');
    }
};
