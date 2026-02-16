<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cms_media_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('media_id')->constrained('cms_media')->cascadeOnDelete();
            $table->string('disk', 100);
            $table->string('path', 500);
            $table->string('variant', 50)->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('size')->nullable();
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cms_media_files');
    }
};
