<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('timesheet_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('timesheet_id')->constrained()->onDelete('cascade');
            // Submitted | HR Review | Revision Requested | Correction Needed | Approved | Resubmitted
            $table->string('status');
            $table->string('actor_name')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('timesheet_events');
    }
};
