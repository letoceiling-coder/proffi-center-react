<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->constrained('sites')->cascadeOnDelete();
            $table->string('phone', 50)->nullable();
            $table->string('email', 255)->nullable();
            $table->string('address_street', 255)->nullable();
            $table->string('address_locality', 255)->nullable();
            $table->string('address_postal_code', 20)->nullable();
            $table->text('work_time')->nullable();
            $table->string('company_name', 255)->nullable();
            $table->foreignId('logo_media_id')->nullable()->constrained('cms_media')->nullOnDelete();
            $table->string('price_display_from', 50)->nullable();
            $table->string('legal_link', 500)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_contacts');
    }
};
