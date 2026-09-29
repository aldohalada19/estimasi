<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Simulation extends Model
{
    use HasFactory;

    protected $table = 'simulations';

    protected $fillable = [
        'scenario_name',
        'luas_lahan',
        'pohon_per_ha',
        'usia_pohon',
        'produksi_per_pohon',
        'persentase_panen',
        'siklus_bulan',
        'hari_kerja_bulan',
        'produksi_per_panen',
        'target_kebun_pct',
        'kebutuhan_pabrik',
        'total_pohon',
        'produksi_harian',
        'supply_kebun_pct',
        'blocks_json'
    ];

    protected $casts = [
        'blocks_json' => 'array',
        'luas_lahan' => 'float',
        'pohon_per_ha' => 'integer',
        'usia_pohon' => 'integer',
        'produksi_per_pohon' => 'float',
        'persentase_panen' => 'float',
        'siklus_bulan' => 'integer',
        'hari_kerja_bulan' => 'integer',
        'produksi_per_panen' => 'float',
        'target_kebun_pct' => 'float',
        'kebutuhan_pabrik' => 'float',
        'total_pohon' => 'integer',
        'produksi_harian' => 'float',
        'supply_kebun_pct' => 'float'
    ];
}
