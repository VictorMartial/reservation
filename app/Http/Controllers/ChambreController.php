<?php

namespace App\Http\Controllers;

use App\Models\Chambre;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ChambreController extends Controller
{
    public function index()
    {
        $chambres = Chambre::all();
        return response()->json($chambres);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'numero' => 'required|string|unique:chambres',
            'type' => 'required|in:standard,familiale,bungalow',
            'prix' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'equipements' => 'nullable|array',
            'image' => 'nullable|string',
            'disponible' => 'boolean'
        ]);

        $chambre = Chambre::create($validated);
        return response()->json($chambre, 201);
    }

    public function show(Chambre $chambre)
    {
        return response()->json($chambre);
    }

    public function update(Request $request, Chambre $chambre)
    {
        $validated = $request->validate([
            'numero' => 'string|unique:chambres,numero,' . $chambre->id,
            'type' => 'in:standard,familiale,bungalow',
            'prix' => 'numeric|min:0',
            'description' => 'nullable|string',
            'equipements' => 'nullable|array',
            'image' => 'nullable|string',
            'disponible' => 'boolean'
        ]);

        $chambre->update($validated);
        return response()->json($chambre);
    }

    public function destroy(Chambre $chambre)
    {
        $chambre->delete();
        return response()->json(null, 204);
    }

    public function checkDisponibilite(Request $request, Chambre $chambre)
    {
        $validated = $request->validate([
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_debut'
        ]);

        $disponible = $chambre->isDisponible($validated['date_debut'], $validated['date_fin']);
        return response()->json(['disponible' => $disponible]);
    }

    public function chambresDisponibles(Request $request)
    {
        $validated = $request->validate([
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_debut',
            'type' => 'nullable|in:standard,familiale,bungalow'
        ]);

        $query = Chambre::where('disponible', true);
        
        if (isset($validated['type'])) {
            $query->where('type', $validated['type']);
        }

        $chambres = $query->get()->filter(function ($chambre) use ($validated) {
            return $chambre->isDisponible($validated['date_debut'], $validated['date_fin']);
        });

        return response()->json($chambres->values());
    }
}
