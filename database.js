const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'kebun_simulasi.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Gagal membuka database SQLite:', err.message);
    } else {
        console.log('Terhubung ke database SQLite:', dbPath);
    }
});

// Inisialisasi tabel simulasi dengan kolom target_kebun_pct fleksibel
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS simulations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scenario_name TEXT NOT NULL,
            luas_lahan REAL NOT NULL,
            pohon_per_ha INTEGER NOT NULL,
            usia_pohon INTEGER NOT NULL,
            produksi_per_pohon REAL NOT NULL,
            persentase_panen REAL NOT NULL,
            siklus_bulan INTEGER DEFAULT 3,
            hari_kerja_bulan INTEGER DEFAULT 20,
            produksi_per_panen REAL DEFAULT 37.5,
            target_kebun_pct REAL DEFAULT 10,
            kebutuhan_pabrik REAL DEFAULT 8000000,
            total_pohon INTEGER NOT NULL,
            produksi_harian REAL NOT NULL,
            supply_kebun_pct REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error membuat tabel simulations:', err.message);
        } else {
            console.log('Tabel simulations siap digunakan.');
            
            // Auto migrate jika kolom belum ada pada DB lama
            db.run(`ALTER TABLE simulations ADD COLUMN siklus_bulan INTEGER DEFAULT 3`, () => {});
            db.run(`ALTER TABLE simulations ADD COLUMN hari_kerja_bulan INTEGER DEFAULT 20`, () => {});
            db.run(`ALTER TABLE simulations ADD COLUMN produksi_per_panen REAL DEFAULT 37.5`, () => {});
            db.run(`ALTER TABLE simulations ADD COLUMN target_kebun_pct REAL DEFAULT 10`, () => {});
        }
    });
});

module.exports = db;
