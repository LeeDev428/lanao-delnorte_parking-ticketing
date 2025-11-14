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
        Schema::create('rate_settings', function (Blueprint $table) {
            $table->id();
            $table->enum('rate_type', ['hourly', 'flat_rate', 'overnight'])->unique();
            $table->decimal('price', 10, 2);
            $table->integer('duration_minutes')->nullable()->comment('Duration in minutes for flat_rate/overnight');
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
    }
};
