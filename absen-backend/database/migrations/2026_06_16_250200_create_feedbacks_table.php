<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feedbacks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('period'); // e.g. "Q1 2026"
            $table->string('reviewer_name');
            $table->string('reviewer_role')->nullable();
            // manager | peer
            $table->string('type')->default('peer');
            $table->string('category')->nullable();
            $table->decimal('rating', 2, 1)->nullable();
            $table->text('summary')->nullable(); // short highlight
            $table->text('body')->nullable();     // full feedback
            // pending | acknowledged
            $table->string('status')->default('pending');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feedbacks');
    }
};
