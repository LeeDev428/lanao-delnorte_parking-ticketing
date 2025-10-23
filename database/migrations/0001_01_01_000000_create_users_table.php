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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', ['admin', 'agent'])->default('agent');
            $table->boolean('is_active')->default(true);
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        // Tickets table
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_id')->unique(); // P23-0214
            $table->string('plate_number')->nullable(); // ABC-1234
            $table->string('parking_zone'); // Zone 3
            $table->enum('rate_type', ['hourly', 'flat_rate', 'overnight'])->default('hourly');
            $table->decimal('price', 10, 2); // 40.00
            $table->timestamp('entry_time');
            $table->timestamp('exit_time')->nullable();
            $table->integer('duration_minutes')->nullable(); // 74 minutes
            $table->enum('status', ['active', 'paid', 'cancelled'])->default('active');
            $table->foreignId('agent_id')->constrained('users')->onDelete('cascade'); // Who created it
            $table->string('photo_path')->nullable(); // Optional plate scan
            $table->timestamps();
        });

        // Payments table
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('receipt_number')->unique(); // TKT-23041
            $table->foreignId('ticket_id')->constrained('tickets')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->enum('payment_method', ['cash', 'gcash', 'card'])->default('cash');
            $table->timestamp('paid_at');
            $table->foreignId('collected_by')->constrained('users')->onDelete('cascade'); // Agent who collected
            $table->string('qr_code_path')->nullable(); // QR code for receipt
            $table->timestamps();
        });

        // Rate Settings table - Admin configures parking rates
        Schema::create('rate_settings', function (Blueprint $table) {
            $table->id();
            $table->enum('rate_type', ['hourly', 'flat_rate', 'overnight'])->unique();
            $table->decimal('price', 10, 2); // Price per hour for hourly, fixed price for others
            $table->integer('duration_minutes')->nullable(); // For flat_rate and overnight (fixed duration)
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rate_settings');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('tickets');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
