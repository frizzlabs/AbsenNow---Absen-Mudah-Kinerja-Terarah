<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payslips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('period_label'); // e.g. "Februari 2026"
            $table->date('period_start');
            $table->date('period_end');
            // gaji | bonus
            $table->string('type')->default('gaji');
            $table->decimal('gross_salary', 15, 2)->default(0);
            $table->decimal('total_deductions', 15, 2)->default(0);
            $table->decimal('net_salary', 15, 2)->default(0);
            // dibayar | menunggu | diproses
            $table->string('status')->default('menunggu');
            $table->date('paid_date')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('bank_account_masked')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payslips');
    }
};
