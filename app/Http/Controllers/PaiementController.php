<?php

namespace App\Http\Controllers;

use App\Models\Paiement;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use PayPal\Rest\ApiContext;
use PayPal\Auth\OAuthTokenCredential;
use PayPal\Api\Amount;
use PayPal\Api\Item;
use PayPal\Api\ItemList;
use PayPal\Api\Payer;
use PayPal\Api\Payment;
use PayPal\Api\PaymentExecution;
use PayPal\Api\RedirectUrls;
use PayPal\Api\Transaction;
use PayPal\Exception\PayPalConnectionException;

class PaiementController extends Controller
{
    private $apiContext;

    public function __construct()
    {
        // Vérifier que les configurations PayPal existent
        if (config('paypal.client_id') && config('paypal.client_secret')) {
            $this->apiContext = new ApiContext(
                new OAuthTokenCredential(
                    config('paypal.client_id'),
                    config('paypal.client_secret')
                )
            );

            $this->apiContext->setConfig(config('paypal.settings', []));
        }
    }

    public function index(Request $request)
    {
        try {
            $query = Paiement::with(['reservation']);

            if (Auth::check() && Auth::user()->isClient()) {
                $query->whereHas('reservation', function ($q) {
                    $q->where('user_id', Auth::id());
                });
            }

            if ($request->filled('statut')) {
                $query->where('statut', $request->statut);
            }

            $paiements = $query->get();

            return response()->json($paiements);
        } catch (\Exception $ex) {
            Log::error('Erreur lors de la récupération des paiements: ' . $ex->getMessage());
            return response()->json(['error' => 'Erreur lors de la récupération des paiements'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'reservation_id' => 'required|exists:reservations,id',
                'montant' => 'required|numeric|min:0.01',
                'mode' => 'required|in:especes,carte,mobile_money,virement,paypal',
                'statut' => 'sometimes|in:en_attente,valide,echec,rembourse',
                'reference_transaction' => 'nullable|string|max:255',
                'date_paiement' => 'nullable|date',
            ]);

            if (!isset($validated['statut'])) {
                $validated['statut'] = 'en_attente';
            }

            $reservation = Reservation::findOrFail($validated['reservation_id']);

            // Vérification des autorisations
            if (Auth::check() && method_exists(Auth::user(), 'isClient') && Auth::user()->isClient() && $reservation->user_id !== Auth::id()) {
                return response()->json(['error' => 'Non autorisé'], 403);
            }

            // Traitement spécial pour PayPal
            if ($validated['mode'] === 'paypal') {
                return $this->createPayPalPayment($validated, $reservation);
            }

            // Pour les autres modes de paiement
            $validated['date_paiement'] = $validated['date_paiement'] ?? now();
            $validated['reference_transaction'] = $validated['reference_transaction'] ?? 'PAY-' . Str::upper(Str::random(10));
            
            // Pour les paiements non-PayPal, on peut les marquer comme valides directement
            if (in_array($validated['mode'], ['carte', 'mobile_money', 'virement'])) {
                $validated['statut'] = 'valide';
            }

            $paiement = Paiement::create($validated);

            return response()->json([
                'success' => true,
                'paiement' => $paiement->load('reservation')
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $ex) {
            return response()->json([
                'error' => 'Données invalides',
                'details' => $ex->errors()
            ], 422);
        } catch (\Exception $ex) {
            Log::error('Erreur lors de la création du paiement: ' . $ex->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la création du paiement',
                'message' => $ex->getMessage()
            ], 500);
        }
    }

    public function createPayPalPayment(array $validated, Reservation $reservation)
    {
        try {
            // Vérifier si PayPal est configuré
            if (!$this->apiContext) {
                throw new \Exception('PayPal n\'est pas configuré correctement');
            }

            $paiement = Paiement::create([
                'reservation_id' => $validated['reservation_id'],
                'montant' => $validated['montant'],
                'mode' => 'paypal',
                'statut' => 'en_attente',
                'date_paiement' => now(),
                'reference_transaction' => 'PAYPAL-' . Str::upper(Str::random(10)),
            ]);

            $payer = new Payer();
            $payer->setPaymentMethod('paypal');

            $item = new Item();
            $item->setName('Réservation #' . $reservation->id)
                 ->setCurrency('EUR')
                 ->setQuantity(1)
                 ->setPrice($validated['montant']);

            $itemList = new ItemList();
            $itemList->setItems([$item]);

            $amount = new Amount();
            $amount->setCurrency('EUR')->setTotal($validated['montant']);

            $transaction = new Transaction();
            $transaction->setAmount($amount)
                        ->setItemList($itemList)
                        ->setDescription('Paiement pour réservation #' . $reservation->id)
                        ->setInvoiceNumber($paiement->reference_transaction);

            $redirectUrls = new RedirectUrls();
            $redirectUrls->setReturnUrl(url('/api/paypal/success/' . $paiement->id))
                         ->setCancelUrl(url('/api/paypal/cancel/' . $paiement->id));

            $payment = new Payment();
            $payment->setIntent('sale')
                    ->setPayer($payer)
                    ->setRedirectUrls($redirectUrls)
                    ->setTransactions([$transaction]);

            $payment->create($this->apiContext);

            $paiement->update(['paypal_payment_id' => $payment->getId()]);

            return response()->json([
                'success' => true,
                'paiement' => $paiement->load('reservation'),
                'paypal_redirect_url' => $payment->getApprovalLink(),
            ], 201);

        } catch (PayPalConnectionException $ex) {
            Log::error('PayPal connection error: ' . $ex->getMessage());
            Log::error('PayPal response: ' . $ex->getData());

            return response()->json([
                'error' => 'Erreur de connexion PayPal',
                'message' => 'Impossible de se connecter à PayPal. Veuillez réessayer plus tard.',
            ], 500);
        } catch (\Exception $ex) {
            Log::error('Erreur création paiement PayPal: ' . $ex->getMessage());

            return response()->json([
                'error' => 'Erreur lors de la création du paiement PayPal',
                'message' => $ex->getMessage(),
            ], 500);
        }
    }

    public function paypalSuccess(Request $request, Paiement $paiement)
    {
        try {
            if (!$request->has('PayerID') || !$request->has('paymentId')) {
                return response()->json(['error' => 'Paramètres manquants'], 400);
            }

            if (!$this->apiContext) {
                throw new \Exception('PayPal n\'est pas configuré correctement');
            }

            $payment = Payment::get($paiement->paypal_payment_id, $this->apiContext);

            $execution = new PaymentExecution();
            $execution->setPayerId($request->PayerID);

            $result = $payment->execute($execution, $this->apiContext);

            if ($result->getState() === 'approved') {
                $paiement->update([
                    'statut' => 'valide',
                    'paypal_payer_id' => $request->PayerID,
                    'paypal_payment_status' => $result->getState(),
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Paiement PayPal réussi',
                    'paiement' => $paiement->load('reservation'),
                ]);
            } else {
                $paiement->update(['statut' => 'echec']);
                return response()->json([
                    'success' => false,
                    'message' => 'Paiement PayPal échoué',
                ], 400);
            }

        } catch (PayPalConnectionException $ex) {
            Log::error('Erreur PayPal Success: ' . $ex->getMessage());
            $paiement->update(['statut' => 'echec']);
            return response()->json([
                'error' => 'Erreur lors de la validation PayPal',
                'message' => 'Problème de connexion avec PayPal',
            ], 500);
        } catch (\Exception $ex) {
            Log::error('Erreur inattendue PayPal Success: ' . $ex->getMessage());
            $paiement->update(['statut' => 'echec']);
            return response()->json([
                'error' => 'Erreur inattendue',
                'message' => $ex->getMessage(),
            ], 500);
        }
    }

    public function paypalCancel(Paiement $paiement)
    {
        try {
            $paiement->update(['statut' => 'annule']);

            return response()->json([
                'success' => false,
                'message' => 'Paiement PayPal annulé par l\'utilisateur',
            ]);
        } catch (\Exception $ex) {
            Log::error('Erreur lors de l\'annulation PayPal: ' . $ex->getMessage());
            return response()->json([
                'error' => 'Erreur lors de l\'annulation',
                'message' => $ex->getMessage(),
            ], 500);
        }
    }

    public function show(Paiement $paiement)
    {
        try {
            if (Auth::check() && method_exists(Auth::user(), 'isClient') && Auth::user()->isClient() && $paiement->reservation->user_id !== Auth::id()) {
                return response()->json(['error' => 'Non autorisé'], 403);
            }

            return response()->json($paiement->load('reservation'));
        } catch (\Exception $ex) {
            Log::error('Erreur lors de la récupération du paiement: ' . $ex->getMessage());
            return response()->json(['error' => 'Erreur lors de la récupération du paiement'], 500);
        }
    }

    public function update(Request $request, Paiement $paiement)
    {
        try {
            if (Auth::check() && method_exists(Auth::user(), 'isClient') && Auth::user()->isClient()) {
                return response()->json(['error' => 'Non autorisé'], 403);
            }

            $validated = $request->validate([
                'statut' => 'required|in:en_attente,valide,echec,rembourse,annule',
                'reference_transaction' => 'nullable|string|max:255',
            ]);

            $paiement->update($validated);

            return response()->json($paiement->load('reservation'));
        } catch (\Illuminate\Validation\ValidationException $ex) {
            return response()->json([
                'error' => 'Données invalides',
                'details' => $ex->errors()
            ], 422);
        } catch (\Exception $ex) {
            Log::error('Erreur lors de la mise à jour du paiement: ' . $ex->getMessage());
            return response()->json(['error' => 'Erreur lors de la mise à jour du paiement'], 500);
        }
    }

    public function valider(Paiement $paiement)
    {
        try {
            if (Auth::check() && method_exists(Auth::user(), 'isClient') && Auth::user()->isClient()) {
                return response()->json(['error' => 'Non autorisé'], 403);
            }

            $paiement->update(['statut' => 'valide']);

            return response()->json($paiement);
        } catch (\Exception $ex) {
            Log::error('Erreur lors de la validation du paiement: ' . $ex->getMessage());
            return response()->json(['error' => 'Erreur lors de la validation du paiement'], 500);
        }
    }

    public function rembourser(Paiement $paiement)
    {
        try {
            if (!Auth::check() || !method_exists(Auth::user(), 'isAdmin') || !Auth::user()->isAdmin()) {
                return response()->json(['error' => 'Non autorisé'], 403);
            }

            if ($paiement->mode === 'paypal' && $paiement->paypal_payment_id) {
                return $this->refundPayPalPayment($paiement);
            }

            $paiement->update(['statut' => 'rembourse']);

            return response()->json($paiement);
        } catch (\Exception $ex) {
            Log::error('Erreur lors du remboursement: ' . $ex->getMessage());
            return response()->json(['error' => 'Erreur lors du remboursement'], 500);
        }
    }

    private function refundPayPalPayment(Paiement $paiement)
    {
        try {
            if (!$this->apiContext) {
                throw new \Exception('PayPal n\'est pas configuré correctement');
            }

            $payment = Payment::get($paiement->paypal_payment_id, $this->apiContext);

            $relatedResources = $payment->getTransactions()[0]->getRelatedResources();
            if (!isset($relatedResources[0])) {
                throw new \Exception('Ressource liée au paiement PayPal introuvable');
            }

            $sale = $relatedResources[0]->getSale();

            $refund = new \PayPal\Api\Refund();
            $amount = new Amount();
            $amount->setCurrency('EUR')->setTotal($paiement->montant);
            $refund->setAmount($amount);

            $refundedSale = $sale->refund($refund, $this->apiContext);

            if ($refundedSale->getState() === 'completed') {
                $paiement->update([
                    'statut' => 'rembourse',
                    'paypal_refund_id' => $refundedSale->getId(),
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Remboursement PayPal réussi',
                    'paiement' => $paiement,
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Échec du remboursement PayPal',
                ], 400);
            }

        } catch (PayPalConnectionException $ex) {
            Log::error('Erreur remboursement PayPal: ' . $ex->getMessage());

            return response()->json([
                'error' => 'Erreur lors du remboursement PayPal',
                'message' => 'Problème de connexion avec PayPal',
            ], 500);
        } catch (\Exception $ex) {
            Log::error('Erreur inattendue remboursement PayPal: ' . $ex->getMessage());

            return response()->json([
                'error' => 'Erreur inattendue lors du remboursement',
                'message' => $ex->getMessage(),
            ], 500);
        }
    }
}