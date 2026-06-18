<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Hindari bentrok dengan modul 'Permission' (izin karyawan) yang sudah ada.
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();   // "leave.approve"
            $table->string('module');           // "leave"
            $table->string('action');           // view | create | approve | manage
            $table->string('module_label');     // "Cuti"
            $table->string('action_label');     // "Setujui"
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('role_permissions');
    }
};
