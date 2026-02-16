<?php

namespace App\Http\Controllers;

use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TableController extends Controller
{
    public function index()
    {
        $tables = Table::all();
        return response()->json($tables);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'numero' => 'required|string|unique:tables',
            'nombre_places' => 'required|integer|min:1',
            'type' => 'required|in:interieur,terrasse,vip',
            'disponible' => 'boolean'
        ]);

        $table = Table::create($validated);
        return response()->json($table, 201);
    }

    public function show(Table $table)
    {
        return response()->json($table);
    }

    public function update(Request $request, Table $table)
    {
        $validated = $request->validate([
            'numero' => 'string|unique:tables,numero,' . $table->id,
            'nombre_places' => 'integer|min:1',
            'type' => 'in:interieur,terrasse,vip',
            'disponible' => 'boolean'
        ]);

        $table->update($validated);
        return response()->json($table);
    }

    public function destroy(Table $table)
    {
        $table->delete();
        return response()->json(null, 204);
    }

    public function checkDisponibilite(Request $request, Table $table)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'heure_debut' => 'required|date_format:H:i',
            'heure_fin' => 'required|date_format:H:i|after:heure_debut'
        ]);

        $disponible = $table->isDisponible($validated['date'], $validated['heure_debut'], $validated['heure_fin']);
        return response()->json(['disponible' => $disponible]);
    }

    public function tablesDisponibles(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'heure_debut' => 'required|date_format:H:i',
            'heure_fin' => 'required|date_format:H:i|after:heure_debut',
            'nombre_personnes' => 'nullable|integer|min:1',
            'type' => 'nullable|in:interieur,terrasse,vip'
        ]);

        $query = Table::where('disponible', true);

        if (isset($validated['nombre_personnes'])) {
            $query->where('nombre_places', '>=', $validated['nombre_personnes']);
        }

        if (isset($validated['type'])) {
            $query->where('type', $validated['type']);
        }

        $tables = $query->get()->filter(function ($table) use ($validated) {
            return $table->isDisponible($validated['date'], $validated['heure_debut'], $validated['heure_fin']);
        });

        return response()->json($tables->values());
    }
}
