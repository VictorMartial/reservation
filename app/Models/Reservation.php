<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'chambre_id',
        'table_id',
        'date_debut',
        'date_fin',
        'heure_debut',
        'heure_fin',
        'nombre_personnes',
        'montant_total',
        'statut',
        'user_id',
        'nom',
        'prenom',
        'email',
        'telephone',
        'adresse',
        'ville',
        'code_postal',
        'commentaires',
        'numero_reservation'
    ];

    

    protected $casts = [
        'date_debut' => 'date:Y-m-d',
        'date_fin' => 'date:Y-m-d',
        'montant_total' => 'decimal:2',
        'nombre_personnes' => 'integer',
    ];

    protected $attributes = [
        'statut' => 'en_attente',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function chambre()
    {
        return $this->belongsTo(Chambre::class);
    }

    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    public function paiements()
    {
        return $this->hasMany(Paiement::class);
    }

    public function scopeParType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeParStatut($query, $statut)
    {
        return $query->where('statut', $statut);
    }

    public function calculerMontantTotal()
    {
        if ($this->type === 'chambre' && $this->chambre) {
            $nombreJours = $this->date_debut->diffInDays($this->date_fin) + 1;
            return $this->chambre->prix * $nombreJours;
        }
        
        return 0;
    }
}