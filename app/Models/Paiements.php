<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Paiement extends Model
{
    use HasFactory;

    protected $fillable = [
        'reservation_id',
        'montant',
        'mode',
        'statut',
        'date_paiement',
        'reference_transaction',
        'paypal_payment_id',
        'paypal_payer_id',
        'paypal_payment_status',
        'paypal_refund_id',
    ];

    protected $casts = [
        'montant' => 'decimal:2',
        'date_paiement' => 'datetime',
    ];

    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }

    public function isPayPal(): bool
    {
        return $this->mode === 'paypal';
    }

    public function isPayPalCompleted(): bool
    {
        return $this->isPayPal() && $this->paypal_payment_status === 'approved';
    }
}
