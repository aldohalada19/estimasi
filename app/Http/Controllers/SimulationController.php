<?php

namespace App\Http\Controllers;

use App\Models\Simulation;
use Illuminate\Http\Request;

class SimulationController extends Controller
{
    /**
     * Tampilkan halaman utama simulasi estimasi
     */
    public function index()
    {
        $savedScenarios = Simulation::orderBy('created_at', 'desc')->get();
        return view('simulasi', compact('savedScenarios'));
    }

    /**
     * API: Ambil semua data simulasi tersimpan
     */
    public function getSimulations()
    {
        $data = Simulation::orderBy('created_at', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * API: Simpan skenario baru ke database SQLite
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'scenario_name'       => 'required|string|max:255',
            'luas_lahan'          => 'required|numeric',
            'pohon_per_ha'        => 'required|numeric',
            'usia_pohon'          => 'nullable|numeric',
            'produksi_per_pohon'  => 'nullable|numeric',
            'persentase_panen'    => 'nullable|numeric',
            'siklus_bulan'        => 'nullable|numeric',
            'hari_kerja_bulan'    => 'nullable|numeric',
            'produksi_per_panen'  => 'nullable|numeric',
            'target_kebun_pct'    => 'nullable|numeric',
            'kebutuhan_pabrik'    => 'nullable|numeric',
            'total_pohon'         => 'required|numeric',
            'produksi_harian'     => 'required|numeric',
            'supply_kebun_pct'    => 'required|numeric',
            'blocks_json'         => 'nullable'
        ]);

        // Tangani blocks_json jika berupa string json dari fetch atau array
        if (isset($validated['blocks_json'])) {
            if (is_string($validated['blocks_json'])) {
                $decoded = json_decode($validated['blocks_json'], true);
                $validated['blocks_json'] = is_array($decoded) ? $decoded : [];
            } elseif (!is_array($validated['blocks_json'])) {
                $validated['blocks_json'] = [];
            }
        }

        $simulation = Simulation::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Skenario Multi-Blok berhasil disimpan ke SQLite!',
            'data'    => $simulation
        ], 201);
    }

    /**
     * API: Hapus skenario dari SQLite
     */
    public function destroy($id)
    {
        $simulation = Simulation::find($id);

        if (!$simulation) {
            return response()->json([
                'success' => false,
                'error'   => 'Skenario tidak ditemukan.'
            ], 404);
        }

        $simulation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Skenario berhasil dihapus dari database SQLite.'
        ]);
    }
}
