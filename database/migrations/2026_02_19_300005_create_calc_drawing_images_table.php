<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calc_drawing_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('drawing_id')->constrained('calc_drawings')->cascadeOnDelete();
            $table->enum('type', ['png', 'png_alt']);
            $table->string('path');
            $table->string('disk')->default('public');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calc_drawing_images');
    }
};
