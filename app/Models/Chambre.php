<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chambre extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero',
        'type',
        'prix',
        'description',
        'equipements',
        'image',
        'disponible',
    ];

    protected $casts = [
        'equipements' => 'array',
        'prix' => 'decimal:2',
        'disponible' => 'boolean',
    ];

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function isDisponible($dateDebut, $dateFin)
    {
        if (!$this->disponible) {
            return false;
        }

        return !$this->reservations()
            ->where('statut', '!=', 'annulee')
            ->where(function ($query) use ($dateDebut, $dateFin) {
                $query->whereBetween('date_debut', [$dateDebut, $dateFin])
                      ->orWhereBetween('date_fin', [$dateDebut, $dateFin])
                      ->orWhere(function ($q) use ($dateDebut, $dateFin) {
                          $q->where('date_debut', '<=', $dateDebut)
                            ->where('date_fin', '>=', $dateFin);
                      });
            })->exists();
    }
}
