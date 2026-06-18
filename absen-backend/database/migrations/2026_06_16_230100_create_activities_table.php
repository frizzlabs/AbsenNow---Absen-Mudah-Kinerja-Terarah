<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('timesheet_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('project')->nullable();
            $table->string('project_color')->default('primary');
            // development | meeting | admin | design | qa
            $table->string('category')->default('development');
            $table->date('activity_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('duration_minutes')->default(0);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
