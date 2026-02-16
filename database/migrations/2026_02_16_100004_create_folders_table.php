<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('folders', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('src')->default('folder');
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->integer('position')->default(0);
            $table->timestamps();
        });
        Schema::table('folders', function (Blueprint $table) {
            $table->foreign('parent_id')->references('id')->on('folders')->onDelete('cascade');
        });
        $now = now();
        DB::table('folders')->insert([
            ['name' => 'Общая', 'slug' => 'common', 'src' => 'folder', 'position' => 0, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Видео', 'slug' => 'video', 'src' => 'video', 'position' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Документы', 'slug' => 'document', 'src' => 'document', 'position' => 2, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Корзина', 'slug' => 'basket', 'src' => 'basket', 'position' => 3, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('folders');
    }
};
