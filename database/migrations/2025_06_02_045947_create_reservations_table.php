<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['chambre', 'table']);
            $table->foreignId('chambre_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('table_id')->nullable()->constrained()->onDelete('cascade');
            $table->date('date_debut')->nullable();
            $table->date('date_fin')->nullable();
            $table->time('heure_debut')->nullable();
            $table->time('heure_fin')->nullable();
            $table->integer('nombre_personnes')->default(1);
            $table->decimal('montant_total', 10, 2);
            $table->enum('statut', ['en_attente', 'confirmee', 'annulee', 'terminee'])->default('en_attente');
            $table->text('commentaires')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
