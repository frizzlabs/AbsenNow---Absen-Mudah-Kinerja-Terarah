<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kpi_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kpi_id')->constrained()->onDelete('cascade');
            $table->string('label'); // "5.2% Achievement"
            $table->string('note')->nullable(); // "Updated by System"
            $table->date('event_date');
            $table->string('color')->default('blue'); // green | blue
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kpi_histories');
    }
};
