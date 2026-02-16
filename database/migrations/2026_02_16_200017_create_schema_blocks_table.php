<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schema_blocks', function (Blueprint $table) {
            $table->id();
            $table->string('schemaable_type', 255);
            $table->unsignedBigInteger('schemaable_id');
            $table->string('type', 50);
            $table->json('data');
            $table->boolean('is_enabled')->default(true)->index();
            $table->smallInteger('order')->default(0);
            $table->timestamps();
            $table->index(['schemaable_type', 'schemaable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schema_blocks');
    }
};
