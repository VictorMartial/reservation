<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('nom')->after('montant_total');
            $table->string('prenom')->after('nom');
            $table->string('email')->after('prenom');
            $table->string('telephone')->after('email');
            $table->string('adresse')->nullable()->after('telephone');
            $table->string('ville')->nullable()->after('adresse');
            $table->string('code_postal')->nullable()->after('ville');
            $table->string('numero_reservation')->unique()->after('commentaires');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn([
                'nom', 'prenom', 'email', 'telephone', 'adresse', 'ville',
                'code_postal', 'numero_reservation'
            ]);
        });
    }
};