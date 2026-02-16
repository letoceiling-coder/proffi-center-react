<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seo_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->constrained('sites')->cascadeOnDelete();
            $table->string('default_title_suffix', 255)->nullable();
            $table->text('default_description')->nullable();
            $table->string('verification_google', 500)->nullable();
            $table->string('verification_yandex', 500)->nullable();
            $table->text('robots_txt_append')->nullable();
            $table->timestamps();
            $table->unique('site_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seo_settings');
    }
};
