<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Table extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero',
        'nombre_places',
        'type',
        'disponible',
    ];

    protected $casts = [
        'nombre_places' => 'integer',
        'disponible' => 'boolean',
    ];

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function isDisponible($date, $heureDebut, $heureFin)
    {
        if (!$this->disponible) {
            return false;
        }

        return !$this->reservations()
            ->where('statut', '!=', 'annulee')
            ->whereDate('date_debut', $date)
            ->where(function ($query) use ($heureDebut, $heureFin) {
                $query->whereBetween('heure_debut', [$heureDebut, $heureFin])
                      ->orWhereBetween('heure_fin', [$heureDebut, $heureFin])
                      ->orWhere(function ($q) use ($heureDebut, $heureFin) {
                          $q->where('heure_debut', '<=', $heureDebut)
                            ->where('heure_fin', '>=', $heureFin);
                      });
            })->exists();
    }
}