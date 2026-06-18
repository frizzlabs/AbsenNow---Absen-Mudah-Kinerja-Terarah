<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();   // slug: superadmin | manager | supervisor | staff
            $table->string('label');            // tampilan: "Super Admin", dll
            $table->string('description')->nullable();
            $table->boolean('is_system')->default(false); // role bawaan (tidak bisa dihapus)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
