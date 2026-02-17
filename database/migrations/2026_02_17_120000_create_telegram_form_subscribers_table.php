<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('telegram_form_subscribers', function (Blueprint $table) {
            $table->id();
            $table->string('chat_id', 32)->unique()->comment('Telegram chat_id (пользователь или группа)');
            $table->string('username', 255)->nullable();
            $table->string('first_name', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('telegram_form_subscribers');
    }
};
