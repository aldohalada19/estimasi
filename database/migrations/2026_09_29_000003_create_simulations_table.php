<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('simulations', function (Blueprint $table) {
            $table->id();
            $table->string('scenario_name');
            $table->decimal('luas_lahan', 12, 2);
            $table->integer('pohon_per_ha');
            $table->integer('usia_pohon')->default(10);
            $table->decimal('produksi_per_pohon', 8, 2)->default(20);
            $table->decimal('persentase_panen', 5, 2)->default(100);
            $table->integer('siklus_bulan')->default(3);
            $table->integer('hari_kerja_bulan')->default(20);
            $table->decimal('produksi_per_panen', 8, 2)->default(20);
            $table->decimal('target_kebun_pct', 5, 2)->default(10);
            $table->decimal('kebutuhan_pabrik', 14, 2)->default(8000000);
            $table->integer('total_pohon');
            $table->decimal('produksi_harian', 12, 2);
            $table->decimal('supply_kebun_pct', 5, 2);
            $table->json('blocks_json')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('simulations');
    }
};
