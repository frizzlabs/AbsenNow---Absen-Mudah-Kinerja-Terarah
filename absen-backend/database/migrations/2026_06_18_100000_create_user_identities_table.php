<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_identities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('id_type'); // ktp, passport
            $table->string('id_number');
            $table->string('id_name');
            $table->date('id_expiry')->nullable();
            $table->string('photo_front_path')->nullable();
            $table->string('photo_back_path')->nullable();
            $table->string('status')->default('pending'); // pending, verified, rejected
            $table->text('admin_note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_identities');
    }
};
