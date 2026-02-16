<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function index()
    {
        // Seuls les admins peuvent voir tous les utilisateurs
        if (!Auth::user()->isAdmin()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $users = User::all();
        return response()->json($users);
    }

    public function store(Request $request)
    {
        // Seuls les admins peuvent créer des utilisateurs
        if (!Auth::user()->isAdmin()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string',
            'role' => 'required|in:client,receptionist,admin'
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $user = User::create($validated);

        return response()->json($user, 201);
    }

    public function show(User $user)
    {
        // Un utilisateur ne peut voir que son propre profil, sauf les admins
        if (!Auth::user()->isAdmin() && Auth::id() !== $user->id) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        return response()->json($user);
    }

    public function update(Request $request, User $user)
    {
        // Un utilisateur ne peut modifier que son propre profil, sauf les admins
        if (!Auth::user()->isAdmin() && Auth::id() !== $user->id) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => 'email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string',
            'role' => 'in:client,receptionist,admin'
        ]);

        // Seuls les admins peuvent changer le rôle
        if (isset($validated['role']) && !Auth::user()->isAdmin()) {
            unset($validated['role']);
        }

        if ($request->has('password')) {
            $request->validate(['password' => 'string|min:8']);
            $validated['password'] = Hash::make($request->password);
        }

        $user->update($validated);
        return response()->json($user);
    }

    public function destroy(User $user)
    {
        // Seuls les admins peuvent supprimer des utilisateurs
        if (!Auth::user()->isAdmin()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $user->delete();
        return response()->json(null, 204);
    }

    public function profile()
    {
        return response()->json(Auth::user());
    }
}
