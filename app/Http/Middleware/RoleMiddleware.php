<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string $roles): Response
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $allowedRoles = explode(',', $roles);
        $userRole = auth()->user()->role;

        if (!in_array($userRole, $allowedRoles)) {
            return response()->json(['error' => 'Accès refusé'], 403);
        }

        return $next($request);
    }
}
