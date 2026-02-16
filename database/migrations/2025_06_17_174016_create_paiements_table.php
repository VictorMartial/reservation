<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('paiements', function (Blueprint $table) {
            $table->string('paypal_payment_id')->nullable()->after('reference_transaction');
            $table->string('paypal_payer_id')->nullable()->after('paypal_payment_id');
            $table->string('paypal_payment_status')->nullable()->after('paypal_payer_id');
            $table->string('paypal_refund_id')->nullable()->after('paypal_payment_status');
        });
    }

    public function down()
    {
        Schema::table('paiements', function (Blueprint $table) {
            $table->dropColumn([
                'paypal_payment_id',
                'paypal_payer_id', 
                'paypal_payment_status',
                'paypal_refund_id'
            ]);
        });
    }
};