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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_id')->unique()->comment('TKT-YYYYMMDD-XXXX format');
            $table->string('plate_number');
            $table->string('parking_zone');
            $table->enum('rate_type', ['hourly', 'flat_rate', 'overnight']);
            $table->decimal('price', 10, 2);
            $table->timestamp('entry_time');
            $table->timestamp('exit_time')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->enum('status', ['active', 'paid', 'cancelled'])->default('active');
            $table->foreignId('agent_id')->constrained('users')->onDelete('cascade');
            $table->string('photo_path')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('agent_id');
            $table->index('entry_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
