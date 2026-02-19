<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calc_client_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('calc_clients')->cascadeOnDelete();
            $table->string('address');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calc_client_addresses');
    }
};
