<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('folders', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->after('position');
            $table->boolean('protected')->default(false)->after('position');
            $table->boolean('is_trash')->default(false)->after('protected');
        });
        Schema::table('folders', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
        Schema::table('folders', function (Blueprint $table) {
            $table->timestamp('deleted_at')->nullable()->after('updated_at');
        });
        DB::table('folders')->whereIn('id', [1, 2, 3])->update(['protected' => true, 'is_trash' => false]);
        DB::table('folders')->where('id', 4)->update(['protected' => true, 'is_trash' => true]);
    }

    public function down(): void
    {
        Schema::table('folders', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn(['user_id', 'protected', 'is_trash', 'deleted_at']);
        });
    }
};
