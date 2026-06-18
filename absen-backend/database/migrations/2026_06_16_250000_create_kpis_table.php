<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kpis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('period'); // e.g. "Q1 2026"
            $table->string('title');
            $table->text('description')->nullable();
            // completed | on_track | at_risk
            $table->string('status')->default('on_track');
            $table->integer('weight')->default(0); // contribution weight (%)
            $table->string('target_label')->nullable(); // "Target: 5.0%"
            $table->string('current_label')->nullable(); // "Current: 5.2%"
            $table->integer('achievement_percent')->default(0); // progress bar value
            $table->date('last_updated')->nullable();
            $table->text('manager_note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kpis');
    }
};
