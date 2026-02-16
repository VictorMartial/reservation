<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MenuController extends Controller
{
    public function index(Request $request)
    {
        $query = Menu::disponible();

        if ($request->has('categorie')) {
            $query->parCategorie($request->categorie);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $menus = $query->get();
        return response()->json($menus);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'required|string',
            'prix' => 'required|numeric|min:0',
            'categorie' => 'required|in:entree,plat,dessert,boisson',
            'type' => 'required|in:local,international',
            'image' => 'nullable|string',
            'disponible' => 'boolean'
        ]);

        $menu = Menu::create($validated);
        return response()->json($menu, 201);
    }

    public function show(Menu $menu)
    {
        return response()->json($menu);
    }

    public function update(Request $request, Menu $menu)
    {
        $validated = $request->validate([
            'nom' => 'string|max:255',
            'description' => 'string',
            'prix' => 'numeric|min:0',
            'categorie' => 'in:entree,plat,dessert,boisson',
            'type' => 'in:local,international',
            'image' => 'nullable|string',
            'disponible' => 'boolean'
        ]);

        $menu->update($validated);
        return response()->json($menu);
    }

    public function destroy(Menu $menu)
    {
        $menu->delete();
        return response()->json(null, 204);
    }

    public function parCategorie($categorie)
    {
        $menus = Menu::disponible()->parCategorie($categorie)->get();
        return response()->json($menus);
    }
}
