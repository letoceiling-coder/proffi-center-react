<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calc_drawings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('client_id')->constrained('calc_clients')->cascadeOnDelete();
            $table->foreignId('address_id')->nullable()->constrained('calc_client_addresses')->nullOnDelete();
            $table->foreignId('room_id')->nullable()->constrained('calc_rooms')->nullOnDelete();
            $table->string('room_note')->nullable();
            $table->string('title')->nullable();
            $table->enum('status', ['draft', 'saved', 'estimated'])->default('saved');

            // Метрики (для быстрой выборки без парсинга JSON)
            $table->decimal('area', 10, 4)->default(0);
            $table->decimal('perimeter', 10, 4)->default(0);
            $table->decimal('perimeter_shrink', 10, 4)->default(0);
            $table->unsignedSmallInteger('corners_count')->default(0);
            $table->decimal('canvas_area', 10, 4)->nullable();
            $table->string('material_name')->nullable();
            $table->decimal('material_price', 10, 2)->nullable();
            $table->decimal('mount_price', 10, 2)->nullable();
            $table->smallInteger('canvas_angle')->nullable();
            $table->boolean('has_seams')->default(false);
            $table->unsignedSmallInteger('seams_count')->default(0);
            $table->unsignedSmallInteger('lighting_count')->default(0);

            // Полные данные
            $table->json('drawing_data')->nullable();
            $table->json('raw_drawing_data')->nullable();
            $table->json('raw_cuts_json')->nullable();
            $table->json('goods_data')->nullable();
            $table->json('works_data')->nullable();

            // SVG изображения (текст, не файл)
            $table->longText('cut_img_svg')->nullable();
            $table->longText('calc_img_svg')->nullable();

            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calc_drawings');
    }
};
