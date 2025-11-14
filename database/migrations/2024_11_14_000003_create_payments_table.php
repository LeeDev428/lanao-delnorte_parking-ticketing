<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('receipt_number')->unique()->comment('TKT-YYYYMMDD-XXXX format');
            $table->foreignId('ticket_id')->constrained('tickets')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->enum('payment_method', ['cash', 'gcash', 'card']);
            $table->timestamp('paid_at');
            $table->foreignId('collected_by')->constrained('users')->onDelete('cascade');
            $table->string('qr_code_path')->nullable();
            $table->timestamps();

            $table->index('ticket_id');
            $table->index('paid_at');
            $table->index('collected_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
