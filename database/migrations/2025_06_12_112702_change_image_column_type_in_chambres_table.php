<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chambres', function (Blueprint $table) {
            // On passe de binary à string (par exemple varchar 255)
            $table->string('image', 255)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('chambres', function (Blueprint $table) {
            // Retour à binary (blob), nullable
            $table->binary('image')->nullable()->change();
        });
    }
};
