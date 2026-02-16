<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->constrained('sites')->cascadeOnDelete();
            $table->string('slug', 100);
            $table->string('title', 255);
            $table->foreignId('image_media_id')->nullable()->constrained('cms_media')->nullOnDelete();
            $table->foreignId('image_active_media_id')->nullable()->constrained('cms_media')->nullOnDelete();
            $table->smallInteger('sort_order')->default(0)->index();
            $table->timestamps();
            $table->unique(['site_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_categories');
    }
};
