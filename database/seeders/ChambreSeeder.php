<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use App\Models\Chambre;

class ChambreSeeder extends Seeder
{
    public function run(): void
    {
        $chambres = [
            [
                'numero' => '101',
                'type' => 'standard',
                'prix' => 75000.00,
                'description' => 'Chambre simple avec salle de bain privée.',
                'equipements' => json_encode(['WiFi', 'TV', 'Climatisation']),
                'image_path' => 'chambres/chambre1.jpg',
            ],
            [
                'numero' => '102',
                'type' => 'familiale',
                'prix' => 120000.00,
                'description' => 'Grande chambre familiale avec 2 lits doubles.',
                'equipements' => json_encode(['WiFi', 'TV', 'Réfrigérateur']),
                'image_path' => 'chambres/chambre2.jpg',
            ],
            [
                'numero' => '103',
                'type' => 'bungalow',
                'prix' => 95000.00,
                'description' => 'Petit bungalow avec terrasse privée.',
                'equipements' => json_encode(['WiFi', 'Terrasse', 'Mini-bar']),
                'image_path' => 'chambres/chambre3.jpg',
            ],
        ];

        foreach ($chambres as $data) {
            $imageBlob = null;

            if (Storage::disk('local')->exists('public/' . $data['image_path'])) {
                $imageBlob = Storage::get('public/' . $data['image_path']);
            }

            Chambre::create([
                'numero' => $data['numero'],
                'type' => $data['type'],
                'prix' => $data['prix'],
                'description' => $data['description'],
                'equipements' => $data['equipements'],
                'image' => $imageBlob,
                'disponible' => true,
            ]);
        }
    }
}
