<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cms_mediables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('media_id')->constrained('cms_media')->cascadeOnDelete();
            $table->string('mediable_type', 255);
            $table->unsignedBigInteger('mediable_id');
            $table->string('role', 50)->nullable();
            $table->smallInteger('order')->default(0);
            $table->timestamps();
            $table->unique(['media_id', 'mediable_type', 'mediable_id', 'role']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cms_mediables');
    }
};
