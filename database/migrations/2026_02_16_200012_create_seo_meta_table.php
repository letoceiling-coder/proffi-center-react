<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seo_meta', function (Blueprint $table) {
            $table->id();
            $table->string('seo_metaable_type', 255);
            $table->unsignedBigInteger('seo_metaable_id');
            $table->string('title', 255)->nullable();
            $table->text('description')->nullable();
            $table->string('h1', 255)->nullable();
            $table->string('canonical_url', 500)->nullable();
            $table->string('robots', 100)->nullable()->index();
            $table->string('og_title', 255)->nullable();
            $table->text('og_description')->nullable();
            $table->foreignId('og_image_media_id')->nullable()->constrained('cms_media')->nullOnDelete();
            $table->string('twitter_card', 50)->nullable();
            $table->string('twitter_title', 255)->nullable();
            $table->timestamps();
            $table->unique(['seo_metaable_type', 'seo_metaable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seo_meta');
    }
};
