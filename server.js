const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: Ambil semua skenario simulasi
app.get('/api/simulations', (req, res) => {
    const query = `SELECT * FROM simulations ORDER BY created_at DESC`;
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ success: false, error: err.message });
            return;
        }
        res.json({ success: true, data: rows });
    });
});

// API: Simpan skenario baru dengan target kebun pct fleksibel
app.post('/api/simulations', (req, res) => {
    const {
        scenario_name,
        luas_lahan,
        pohon_per_ha,
        usia_pohon,
        produksi_per_pohon,
        persentase_panen,
        siklus_bulan,
        hari_kerja_bulan,
        produksi_per_panen,
        target_kebun_pct,
        kebutuhan_pabrik,
        total_pohon,
        produksi_harian,
        supply_kebun_pct
    } = req.body;

    if (!scenario_name || scenario_name.trim() === '') {
        return res.status(400).json({ success: false, error: 'Nama skenario harus diisi.' });
    }

    const query = `
        INSERT INTO simulations (
            scenario_name, luas_lahan, pohon_per_ha, usia_pohon,
            produksi_per_pohon, persentase_panen, siklus_bulan, hari_kerja_bulan, produksi_per_panen, target_kebun_pct,
            kebutuhan_pabrik, total_pohon, produksi_harian, supply_kebun_pct
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
        scenario_name.trim(),
        parseFloat(luas_lahan) || 0,
        parseInt(pohon_per_ha) || 0,
        parseInt(usia_pohon) || 0,
        parseFloat(produksi_per_pohon) || 0,
        parseFloat(persentase_panen) || 0,
        parseInt(siklus_bulan) || 3,
        parseInt(hari_kerja_bulan) || 20,
        parseFloat(produksi_per_panen) || 37.5,
        parseFloat(target_kebun_pct) || 10,
        parseFloat(kebutuhan_pabrik) || 8000000,
        parseInt(total_pohon) || 0,
        parseFloat(produksi_harian) || 0,
        parseFloat(supply_kebun_pct) || 0
    ];

    db.run(query, params, function (err) {
        if (err) {
            res.status(500).json({ success: false, error: err.message });
            return;
        }
        res.json({
            success: true,
            message: 'Skenario berhasil disimpan ke SQLite!',
            data: { id: this.lastID, ...req.body }
        });
    });
});

// API: Hapus skenario
app.delete('/api/simulations/:id', (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM simulations WHERE id = ?`, [id], function (err) {
        if (err) {
            res.status(500).json({ success: false, error: err.message });
            return;
        }
        res.json({ success: true, message: `Skenario #${id} berhasil dihapus.` });
    });
});

app.listen(PORT, () => {
    console.log(`================================================`);
    console.log(`🌴 Server Kebun TMC Simulasi berjalan di:`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`================================================`);
});
