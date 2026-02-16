<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content_blocks', function (Blueprint $table) {
            $table->id();
            $table->string('blockable_type', 255);
            $table->unsignedBigInteger('blockable_id');
            $table->string('type', 100);
            $table->json('data')->nullable();
            $table->smallInteger('order')->default(0);
            $table->timestamps();
            $table->index(['blockable_type', 'blockable_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_blocks');
    }
};
