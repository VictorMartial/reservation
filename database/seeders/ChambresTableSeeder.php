<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ChambresTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('chambres')->insert([
            [
                'numero' => '101',
                'type' => 'standard',
                'description' => 'Chambre standard confortable avec wifi et TV.',
                'prix' => 80.00,
                'disponible' => true,
                'equipements' => json_encode(['wifi', 'tv', 'climatisation']),
                'image' => 'https://example.com/images/chambre101.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'numero' => '102',
                'type' => 'familiale',
                'description' => 'Grande chambre familiale avec minibar et parking.',
                'prix' => 120.00,
                'disponible' => true,
                'equipements' => json_encode(['wifi', 'minibar', 'parking']),
                'image' => 'https://example.com/images/chambre102.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'numero' => '201',
                'type' => 'bungalow',
                'description' => 'Bungalow avec jacuzzi et vue sur la mer.',
                'prix' => 200.00,
                'disponible' => false,
                'equipements' => json_encode(['wifi', 'jacuzzi', 'tv']),
                'image' => 'https://example.com/images/chambre201.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
