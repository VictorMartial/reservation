<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Chambre;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Mail\ReservationConfirmee;


class ReservationController extends Controller
{
    /**
     * Display a listing of reservations based on user role.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Reservation::with(['user', 'chambre', 'table']);

        if ($user->isClient()) {
            $query->where('user_id', $user->id);
        }

        if ($request->has('type')) {
            $query->parType($request->type);
        }

        if ($request->has('statut')) {
            $query->parStatut($request->statut);
        }

        $reservations = $query->get();
        return response()->json($reservations);
    }

    /**
     * Store a new reservation.
     */
    public function store(Request $request)
    {
        $validationRules = [
            'type' => 'required|in:chambre,table',
            'chambre_id' => 'nullable|exists:chambres,id|required_if:type,chambre',
            'table_id' => 'nullable|exists:tables,id|required_if:type,table',
            'date_debut' => 'required|date',
            'date_fin' => 'nullable|date|after:date_debut|required_if:type,chambre',
            'heure_debut' => 'nullable|date_format:H:i|required_if:type,table',
            'heure_fin' => 'nullable|date_format:H:i|after:heure_debut|required_if:type,table',
            'nombre_personnes' => 'required|integer|min:1',
            'montant_total' => 'nullable|numeric|min:0',
            'statut' => 'nullable|in:en_attente,confirmee,annulee,terminee',
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'telephone' => 'required|string|max:20',
            'adresse' => 'nullable|string|max:255',
            'ville' => 'nullable|string|max:255',
            'code_postal' => 'nullable|string|max:10',
            'commentaires' => 'nullable|string',
        ];

        $validated = $request->validate($validationRules);

        if ($validated['type'] === 'chambre') {
            $chambre = Chambre::findOrFail($validated['chambre_id']);

            if (!$chambre->isDisponible($validated['date_debut'], $validated['date_fin'])) {
                return response()->json(['error' => 'Chambre non disponible pour les dates sélectionnées'], 400);
            }

            if (!isset($validated['montant_total'])) {
                $startDate = new \DateTime($validated['date_debut']);
                $endDate = new \DateTime($validated['date_fin']);
                $nights = $startDate->diff($endDate)->days;
                $validated['montant_total'] = $chambre->prix * $nights;
            }
        } else {
            $table = Table::findOrFail($validated['table_id']);

            if (!$table->isDisponible($validated['date_debut'], $validated['heure_debut'], $validated['heure_fin'])) {
                return response()->json(['error' => 'Table non disponible pour la plage horaire sélectionnée'], 400);
            }

            $validated['montant_total'] = $validated['montant_total'] ?? 0;
        }

        $user = Auth::user();
        $validated['user_id'] = $user->id;
        $validated['statut'] = $validated['statut'] ?? 'en_attente';
        $validated['numero_reservation'] = 'RES-' . strtoupper(Str::random(8));

        $reservation = Reservation::create($validated);

        Log::info('Reservation created', ['reservation_id' => $reservation->id, 'user_id' => $user->id]);

        return response()->json($reservation->load(['chambre', 'table']), 201);
    }

    /**
     * Display a specific reservation.
     */
    public function show(Reservation $reservation)
    {
        if (Auth::user()->isClient() && $reservation->user_id !== Auth::id()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        return response()->json($reservation->load(['user', 'chambre', 'table', 'paiements']));
    }

    /**
     * Update a reservation.
     */
    public function update(Request $request, Reservation $reservation)
    {
        if (Auth::user()->isClient() && $reservation->user_id !== Auth::id()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'date_debut' => 'date',
            'date_fin' => 'nullable|date|after:date_debut',
            'heure_debut' => 'nullable|date_format:H:i',
            'heure_fin' => 'nullable|date_format:H:i|after:heure_debut',
            'nombre_personnes' => 'integer|min:1',
            'statut' => 'in:en_attente,confirmee,annulee,terminee',
            'commentaires' => 'nullable|string'
        ]);

        if (isset($validated['statut']) && Auth::user()->isClient()) {
            unset($validated['statut']);
        }

        $reservation->update($validated);
        Log::info('Reservation updated', ['reservation_id' => $reservation->id, 'user_id' => Auth::id()]);

        return response()->json($reservation->load(['user', 'chambre', 'table']));
    }

    /**
     * Delete a reservation.
     */
    public function destroy(Reservation $reservation)
    {
        if (Auth::user()->isClient() && $reservation->user_id !== Auth::id()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $reservation->delete();
        Log::info('Reservation deleted', ['reservation_id' => $reservation->id, 'user_id' => Auth::id()]);

        return response()->json(null, 204);
    }

    /**
     * Confirm a reservation (receptionist/admin only).
     */
    public function confirmer(Reservation $reservation)
    {
        if (Auth::user()->isClient()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        if ($reservation->statut === 'confirmee') {
            return response()->json(['error' => 'La réservation est déjà confirmée'], 400);
        }

        $reservation->update(['statut' => 'confirmee']);

        Mail::to($reservation->email)->send(new ReservationConfirmee($reservation));
        
        Log::info('Reservation confirmed', ['reservation_id' => $reservation->id, 'user_id' => Auth::id()]);

        return response()->json($reservation->load(['user', 'chambre', 'table']));
    }

    /**
     * Cancel a reservation (receptionist/admin only).
     */
    public function annuler(Reservation $reservation)
    {
        if (Auth::user()->isClient()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        if ($reservation->statut === 'annulee') {
            return response()->json(['error' => 'La réservation est déjà annulée'], 400);
        }

        $reservation->update(['statut' => 'annulee']);
        Log::info('Reservation cancelled', ['reservation_id' => $reservation->id, 'user_id' => Auth::id()]);

        return response()->json($reservation->load(['user', 'chambre', 'table']));
    }
}