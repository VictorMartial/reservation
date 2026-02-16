<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'description',
        'prix',
        'categorie',
        'type',
        'image',
        'disponible',
    ];

    protected $casts = [
        'prix' => 'decimal:2',
        'disponible' => 'boolean',
    ];

    public function scopeDisponible($query)
    {
        return $query->where('disponible', true);
    }

    public function scopeParCategorie($query, $categorie)
    {
        return $query->where('categorie', $categorie);
    }
}
