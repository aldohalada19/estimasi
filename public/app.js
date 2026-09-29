document.addEventListener('DOMContentLoaded', () => {

    // Lucide icons initialization
    if (window.lucide) {
        lucide.createIcons();
    }

    // Default Values: Rotasi 3 Bulan, 20 Hari Kerja / Bulan, Target Pabrik 96M/Tahun, Target Kebun 10%
    const DEFAULTS = {
        luasLahan: 200,
        pohonPerHa: 80,
        usiaPohon: 10,
        produksiPerPohon: 37.5, // 37.5 butir per pohon per 3 bulan (150/tahun)
        targetKebunPct: 10,     // Target pasokan kebun internal (10% default)
        persentasePanen: 100,  // 100% efisiensi
        siklusBulan: 3,
        hariKerjaBulan: 20,
        kebutuhanPabrikBulan: 8000000 // 8.000.000/bulan -> 96.000.000/tahun
    };

    // DOM Elements - Sliders & Inputs
    const elements = {
        luasLahanSlider: document.getElementById('luasLahanSlider'),
        luasLahanNum: document.getElementById('luasLahanNum'),
        
        pohonPerHaSlider: document.getElementById('pohonPerHaSlider'),
        pohonPerHaNum: document.getElementById('pohonPerHaNum'),
        
        usiaPohonSlider: document.getElementById('usiaPohonSlider'),
        usiaPohonNum: document.getElementById('usiaPohonNum'),
        
        produksiPerPohonSlider: document.getElementById('produksiPerPohonSlider'),
        produksiPerPohonNum: document.getElementById('produksiPerPohonNum'),
        
        targetKebunPctSlider: document.getElementById('targetKebunPctSlider'),
        targetKebunPctNum: document.getElementById('targetKebunPctNum'),

        persentasePanenSlider: document.getElementById('persentasePanenSlider'),
        persentasePanenNum: document.getElementById('persentasePanenNum'),
        
        hariKerjaNum: document.getElementById('hariKerjaNum'),
        kebutuhanPabrikNum: document.getElementById('kebutuhanPabrikNum'),

        // Badges & Hints
        ageFactorBadge: document.getElementById('ageFactorBadge'),
        annualYieldHint: document.getElementById('annualYieldHint'),
        targetKebunHint: document.getElementById('targetKebunHint'),
        tickLahanIdeal: document.getElementById('tickLahanIdeal'),

        lblKebutuhan3Bulan: document.getElementById('lblKebutuhan3Bulan'),
        lblKebutuhanTahunan: document.getElementById('lblKebutuhanTahunan'),
        lblTotalKebutuhanSiklus: document.getElementById('lblTotalKebutuhanSiklus'),
        lblKpiTargetKebunTitle: document.getElementById('lblKpiTargetKebunTitle'),
        
        // KPI Values
        kpiTotalPohon: document.getElementById('kpiTotalPohon'),
        kpiDensitySubtext: document.getElementById('kpiDensitySubtext'),
        kpiProduksiSiklus: document.getElementById('kpiProduksiSiklus'),
        kpiHasilPerPohonAnnual: document.getElementById('kpiHasilPerPohonAnnual'),
        kpiProduksiHarian: document.getElementById('kpiProduksiHarian'),
        kpiCoverageKebun: document.getElementById('kpiCoverageKebun'),
        kpiPembelianLuarSiklus: document.getElementById('kpiPembelianLuarSiklus'),

        // Gauge & Labels
        kebunProgressBar: document.getElementById('kebunProgressBar'),
        progressTargetMarker: document.getElementById('progressTargetMarker'),
        markerLabel: document.getElementById('markerLabel'),
        lblPercentTercapai: document.getElementById('lblPercentTercapai'),

        // Summary Table
        tblProduksiHarian: document.getElementById('tblProduksiHarian'),
        tblBeliHarian: document.getElementById('tblBeliHarian'),
        tblTotalHarian: document.getElementById('tblTotalHarian'),
        
        tblProduksiBulanan: document.getElementById('tblProduksiBulanan'),
        tblBeliBulanan: document.getElementById('tblBeliBulanan'),
        tblTotalBulanan: document.getElementById('tblTotalBulanan'),

        tblProduksiSiklus: document.getElementById('tblProduksiSiklus'),
        tblBeliSiklus: document.getElementById('tblBeliSiklus'),
        tblTotalSiklus: document.getElementById('tblTotalSiklus'),
        
        tblProduksiTahunan: document.getElementById('tblProduksiTahunan'),
        tblBeliTahunan: document.getElementById('tblBeliTahunan'),
        tblTotalTahunan: document.getElementById('tblTotalTahunan'),

        // Saved Scenarios & Modal
        btnResetDefault: document.getElementById('btnResetDefault'),
        btnOpenSaveModal: document.getElementById('btnOpenSaveModal'),
        saveModal: document.getElementById('saveModal'),
        btnCloseModal: document.getElementById('btnCloseModal'),
        btnCancelModal: document.getElementById('btnCancelModal'),
        saveScenarioForm: document.getElementById('saveScenarioForm'),
        scenarioNameInput: document.getElementById('scenarioNameInput'),
        scenariosTableBody: document.getElementById('scenariosTableBody'),
        btnRefreshScenarios: document.getElementById('btnRefreshScenarios'),

        // Modal Previews
        prevLuas: document.getElementById('prevLuas'),
        prevDensity: document.getElementById('prevDensity'),
        prevUsia: document.getElementById('prevUsia'),
        prevTargetPct: document.getElementById('prevTargetPct'),
        prevHasilPanen: document.getElementById('prevHasilPanen'),
        prevHasilHarian: document.getElementById('prevHasilHarian'),

        toastContainer: document.getElementById('toastContainer')
    };

    let supplyChart = null;

    // Helper: Age Factor Calculation & Description
    function getAgeFactor(usia) {
        if (usia <= 3) return { factor: 0.0, label: 'TBM (Tanaman Belum Menghasilkan)', pct: '0%' };
        if (usia === 4) return { factor: 0.40, label: 'TM Muda 1 (Mulai Berbuah)', pct: '40%' };
        if (usia === 5) return { factor: 0.65, label: 'TM Muda 2 (Sedang Berkembang)', pct: '65%' };
        if (usia === 6) return { factor: 0.85, label: 'TM Muda 3 (Mendekati Puncak)', pct: '85%' };
        if (usia >= 7 && usia <= 20) return { factor: 1.00, label: 'Produksi Puncak / Prima', pct: '100%' };
        if (usia >= 21 && usia <= 25) return { factor: 0.90, label: 'TM Tua 1 (Penurunan Ringan)', pct: '90%' };
        if (usia >= 26 && usia <= 30) return { factor: 0.80, label: 'TM Tua 2 (Penurunan Sedang)', pct: '80%' };
        return { factor: 0.70, label: 'TM Tua 3 (Penurunan Signifikan)', pct: '70%' };
    }

    // Number Formatter
    function formatNumber(num) {
        return new Intl.NumberFormat('id-ID').format(Math.round(num));
    }

    // Update Track Gradient Color for Sliders
    function updateSliderTrack(slider) {
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        const val = parseFloat(slider.value);
        const percentage = ((val - min) / (max - min)) * 100;
        slider.style.background = `linear-gradient(90deg, #10b981 ${percentage}%, rgba(255, 255, 255, 0.1) ${percentage}%)`;
    }

    // Bind slider & number input bidirectionally
    function setupDualBinding(slider, numberInput) {
        slider.addEventListener('input', () => {
            numberInput.value = slider.value;
            updateSliderTrack(slider);
            recalculate();
        });

        numberInput.addEventListener('input', () => {
            let val = parseFloat(numberInput.value) || 0;
            slider.value = val;
            updateSliderTrack(slider);
            recalculate();
        });

        updateSliderTrack(slider);
    }

    setupDualBinding(elements.luasLahanSlider, elements.luasLahanNum);
    setupDualBinding(elements.pohonPerHaSlider, elements.pohonPerHaNum);
    setupDualBinding(elements.usiaPohonSlider, elements.usiaPohonNum);
    setupDualBinding(elements.produksiPerPohonSlider, elements.produksiPerPohonNum);
    setupDualBinding(elements.targetKebunPctSlider, elements.targetKebunPctNum);
    setupDualBinding(elements.persentasePanenSlider, elements.persentasePanenNum);

    elements.hariKerjaNum.addEventListener('input', recalculate);
    elements.kebutuhanPabrikNum.addEventListener('input', recalculate);

    // Main Calculation Logic dengan Target Kebun Fleksibel
    function calculateData() {
        const luasLahan = parseFloat(elements.luasLahanNum.value) || 0;
        const pohonPerHa = parseInt(elements.pohonPerHaNum.value) || 0;
        const usiaPohon = parseInt(elements.usiaPohonNum.value) || 0;
        const produksiPerPanen = parseFloat(elements.produksiPerPohonNum.value) || 0; // butir/pohon per 3 bulan
        const targetKebunPct = parseFloat(elements.targetKebunPctNum.value) || 10;   // % target kebun internal
        const persentasePanen = parseFloat(elements.persentasePanenNum.value) || 100;
        const hariKerjaBulan = parseInt(elements.hariKerjaNum.value) || 20;
        const kebutuhanPabrikBulan = parseFloat(elements.kebutuhanPabrikNum.value) || 8000000;
        const siklusBulan = DEFAULTS.siklusBulan; // 3 bulan

        const ageInfo = getAgeFactor(usiaPohon);
        const totalPohon = luasLahan * pohonPerHa;

        // Frekuensi panen setahun = 12 / 3 = 4 kali
        const frekuensiPanenPerTahun = 12 / siklusBulan;
        
        // Hasil 1 Pohon dalam setahun
        const hasilSetahunPerPohon = produksiPerPanen * frekuensiPanenPerTahun * ageInfo.factor;

        // Total Produksi Kebun
        const totalProduksiTahunan = totalPohon * hasilSetahunPerPohon * (persentasePanen / 100);
        const totalProduksiSiklus3Bulan = totalProduksiTahunan / 4; // Per 3 Bulan
        const totalProduksiBulanan = totalProduksiTahunan / 12;
        
        // Hari Kerja
        const totalHariKerjaSetahun = hariKerjaBulan * 12; // 240 HK / tahun
        const totalHariKerjaSiklus = hariKerjaBulan * 3; // 60 HK / 3 Bulan
        const totalProduksiHarian = totalHariKerjaSetahun > 0 ? (totalProduksiTahunan / totalHariKerjaSetahun) : 0;

        // Target Pabrik Total
        const kebutuhanPabrikSiklus = kebutuhanPabrikBulan * 3; // 24.000.000 per 3 bulan
        const kebutuhanPabrikHarian = hariKerjaBulan > 0 ? (kebutuhanPabrikBulan / hariKerjaBulan) : 0; // 400.000 / hari kerja
        const kebutuhanPabrikTahunan = kebutuhanPabrikBulan * 12; // 96.000.000 per tahun

        // Target Kebun Fleksibel
        const targetKebunSiklus = kebutuhanPabrikSiklus * (targetKebunPct / 100);
        const targetKebunHarian = kebutuhanPabrikHarian * (targetKebunPct / 100);
        const targetKebunTahunan = kebutuhanPabrikTahunan * (targetKebunPct / 100);

        const coverageTargetKebun = targetKebunSiklus > 0 ? (totalProduksiSiklus3Bulan / targetKebunSiklus) * 100 : 0;
        const coverageTotalPabrik = kebutuhanPabrikSiklus > 0 ? (totalProduksiSiklus3Bulan / kebutuhanPabrikSiklus) * 100 : 0;

        // Pembelian Luar
        const pembelianLuarHarian = Math.max(0, kebutuhanPabrikHarian - totalProduksiHarian);
        const pembelianLuarBulanan = Math.max(0, kebutuhanPabrikBulan - totalProduksiBulanan);
        const pembelianLuarSiklus = Math.max(0, kebutuhanPabrikSiklus - totalProduksiSiklus3Bulan);
        const pembelianLuarTahunan = Math.max(0, kebutuhanPabrikTahunan - totalProduksiTahunan);

        // Lahan Ideal untuk Target Kebun % yang Dikofigurasi
        const hasilTahunanPerHa = pohonPerHa * hasilSetahunPerPohon * (persentasePanen / 100);
        const lahanIdeal = hasilTahunanPerHa > 0 ? (targetKebunTahunan / hasilTahunanPerHa) : 0;

        return {
            luasLahan,
            pohonPerHa,
            usiaPohon,
            produksiPerPanen,
            targetKebunPct,
            persentasePanen,
            siklusBulan,
            hariKerjaBulan,
            totalHariKerjaSiklus,
            kebutuhanPabrikBulan,
            kebutuhanPabrikSiklus,
            kebutuhanPabrikHarian,
            kebutuhanPabrikTahunan,
            totalPohon,
            ageInfo,
            frekuensiPanenPerTahun,
            hasilSetahunPerPohon,
            totalProduksiSiklus3Bulan,
            totalProduksiTahunan,
            totalProduksiBulanan,
            totalProduksiHarian,
            targetKebunSiklus,
            targetKebunHarian,
            targetKebunTahunan,
            coverageTargetKebun,
            coverageTotalPabrik,
            pembelianLuarHarian,
            pembelianLuarBulanan,
            pembelianLuarSiklus,
            pembelianLuarTahunan,
            lahanIdeal
        };
    }

    // Recalculate & UI Refresh
    function recalculate() {
        const data = calculateData();

        // Update Badge Usia & Hints
        elements.ageFactorBadge.innerHTML = `<i data-lucide="shield-check"></i> Status Usia: ${data.ageInfo.label} (${data.ageInfo.pct})`;
        elements.annualYieldHint.innerHTML = `💡 Total setahun: ${data.produksiPerPanen} × 4 panen × ${data.ageInfo.pct} = <strong>${Math.round(data.hasilSetahunPerPohon)}</strong> butir / pohon / tahun`;
        elements.targetKebunHint.innerHTML = `🎯 Target kebun diset: <strong>${data.targetKebunPct}%</strong> dari pasokan pabrik (${formatNumber(data.targetKebunHarian)} butir/HK)`;
        
        elements.lblKpiTargetKebunTitle.textContent = `Target Kebun (${data.targetKebunPct}%)`;
        elements.tickLahanIdeal.textContent = `${formatNumber(data.lahanIdeal)} Ha (Target ${data.targetKebunPct}%)`;

        elements.lblKebutuhan3Bulan.textContent = formatNumber(data.kebutuhanPabrikSiklus);
        elements.lblKebutuhanTahunan.textContent = formatNumber(data.kebutuhanPabrikTahunan);
        elements.lblTotalKebutuhanSiklus.textContent = formatNumber(data.kebutuhanPabrikSiklus);
        
        if (window.lucide) lucide.createIcons();

        // KPI Updates
        elements.kpiTotalPohon.textContent = formatNumber(data.totalPohon);
        elements.kpiDensitySubtext.textContent = `${formatNumber(data.luasLahan)} Ha × ${data.pohonPerHa} Pohon/Ha`;

        elements.kpiProduksiSiklus.textContent = `${formatNumber(data.totalProduksiSiklus3Bulan)}`;
        elements.kpiHasilPerPohonAnnual.textContent = `Setahun: ${formatNumber(data.hasilSetahunPerPohon)} Butir/Pohon`;

        elements.kpiProduksiHarian.textContent = `${formatNumber(data.totalProduksiHarian)}`;
        elements.kpiCoverageKebun.textContent = `Target ${data.targetKebunPct}%: ${formatNumber(data.targetKebunHarian)} / HK (${data.coverageTargetKebun.toFixed(1)}% dari target kebun)`;

        elements.kpiPembelianLuarSiklus.textContent = `${formatNumber(data.pembelianLuarSiklus)}`;

        // Progress Gauge & Marker Position
        const progressPct = Math.min(100, data.coverageTotalPabrik);
        elements.kebunProgressBar.style.width = `${progressPct}%`;
        
        // Dynamically position marker on gauge bar
        const markerPosPct = Math.min(100, Math.max(1, data.targetKebunPct));
        elements.progressTargetMarker.style.left = `${markerPosPct}%`;
        elements.markerLabel.textContent = `Target ${data.targetKebunPct}%`;

        elements.lblPercentTercapai.textContent = `${data.coverageTotalPabrik.toFixed(1)}% tercover dari kebun sendiri (${formatNumber(data.totalProduksiSiklus3Bulan)} / ${formatNumber(data.kebutuhanPabrikSiklus)} per 3 bulan) - Target Kebun ${data.targetKebunPct}%`;

        // Table Breakdown Updates
        elements.tblProduksiHarian.textContent = formatNumber(data.totalProduksiHarian);
        elements.tblBeliHarian.textContent = formatNumber(data.pembelianLuarHarian);
        elements.tblTotalHarian.textContent = formatNumber(data.kebutuhanPabrikHarian);

        elements.tblProduksiBulanan.textContent = formatNumber(data.totalProduksiBulanan);
        elements.tblBeliBulanan.textContent = formatNumber(data.pembelianLuarBulanan);
        elements.tblTotalBulanan.textContent = formatNumber(data.kebutuhanPabrikBulan);

        elements.tblProduksiSiklus.textContent = formatNumber(data.totalProduksiSiklus3Bulan);
        elements.tblBeliSiklus.textContent = formatNumber(data.pembelianLuarSiklus);
        elements.tblTotalSiklus.textContent = formatNumber(data.kebutuhanPabrikSiklus);

        elements.tblProduksiTahunan.textContent = formatNumber(data.totalProduksiTahunan);
        elements.tblBeliTahunan.textContent = formatNumber(data.pembelianLuarTahunan);
        elements.tblTotalTahunan.textContent = formatNumber(data.kebutuhanPabrikTahunan);

        // Update Chart
        updateChart(data);
    }

    // Chart.js initialization & update
    function updateChart(data) {
        const ctx = document.getElementById('supplyChart').getContext('2d');
        const supplyKebun = Math.round(data.totalProduksiSiklus3Bulan);
        const beliLuar = Math.round(data.pembelianLuarSiklus);

        if (!supplyChart) {
            supplyChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Pasokan Kebun Internal (3 Bulan)', 'Pembelian dari Luar (3 Bulan)'],
                    datasets: [{
                        data: [supplyKebun, beliLuar],
                        backgroundColor: ['#10b981', '#f59e0b'],
                        borderWidth: 2,
                        borderColor: '#1e293b'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#f8fafc',
                                font: { family: 'Plus Jakarta Sans', size: 12 }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const val = context.raw || 0;
                                    const total = data.kebutuhanPabrikSiklus;
                                    const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                                    return ` ${context.label}: ${formatNumber(val)} Butir (${pct}%)`;
                                }
                            }
                        }
                    },
                    cutout: '70%'
                }
            });
        } else {
            supplyChart.data.datasets[0].data = [supplyKebun, beliLuar];
            supplyChart.update();
        }
    }

    // Reset to Defaults
    elements.btnResetDefault.addEventListener('click', () => {
        elements.luasLahanNum.value = DEFAULTS.luasLahan;
        elements.luasLahanSlider.value = DEFAULTS.luasLahan;
        updateSliderTrack(elements.luasLahanSlider);

        elements.pohonPerHaNum.value = DEFAULTS.pohonPerHa;
        elements.pohonPerHaSlider.value = DEFAULTS.pohonPerHa;
        updateSliderTrack(elements.pohonPerHaSlider);

        elements.usiaPohonNum.value = DEFAULTS.usiaPohon;
        elements.usiaPohonSlider.value = DEFAULTS.usiaPohon;
        updateSliderTrack(elements.usiaPohonSlider);

        elements.produksiPerPohonNum.value = DEFAULTS.produksiPerPohon;
        elements.produksiPerPohonSlider.value = DEFAULTS.produksiPerPohon;
        updateSliderTrack(elements.produksiPerPohonSlider);

        elements.targetKebunPctNum.value = DEFAULTS.targetKebunPct;
        elements.targetKebunPctSlider.value = DEFAULTS.targetKebunPct;
        updateSliderTrack(elements.targetKebunPctSlider);

        elements.persentasePanenNum.value = DEFAULTS.persentasePanen;
        elements.persentasePanenSlider.value = DEFAULTS.persentasePanen;
        updateSliderTrack(elements.persentasePanenSlider);

        elements.hariKerjaNum.value = DEFAULTS.hariKerjaBulan;
        elements.kebutuhanPabrikNum.value = DEFAULTS.kebutuhanPabrikBulan;

        recalculate();
        showToast('Parameter dikembalikan ke default target 10%!');
    });

    // Save Modal Handling
    elements.btnOpenSaveModal.addEventListener('click', () => {
        const data = calculateData();
        elements.prevLuas.textContent = `${formatNumber(data.luasLahan)} Ha`;
        elements.prevDensity.textContent = `${data.pohonPerHa} Pohon/Ha`;
        elements.prevUsia.textContent = `${data.usiaPohon} Tahun`;
        elements.prevTargetPct.textContent = `${data.targetKebunPct}%`;
        elements.prevHasilPanen.textContent = `${formatNumber(data.totalProduksiSiklus3Bulan)} Butir`;
        elements.prevHasilHarian.textContent = `${formatNumber(data.totalProduksiHarian)} Butir/HK`;

        elements.scenarioNameInput.value = `Skenario ${formatNumber(data.luasLahan)} Ha - Target Kebun ${data.targetKebunPct}% (${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})`;
        elements.saveModal.classList.add('active');
    });

    function closeModal() {
        elements.saveModal.classList.remove('active');
    }

    elements.btnCloseModal.addEventListener('click', closeModal);
    elements.btnCancelModal.addEventListener('click', closeModal);

    // Save Scenario to SQLite API
    elements.saveScenarioForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const scenarioName = elements.scenarioNameInput.value.trim();
        if (!scenarioName) return;

        const data = calculateData();
        const payload = {
            scenario_name: scenarioName,
            luas_lahan: data.luasLahan,
            pohon_per_ha: data.pohonPerHa,
            usia_pohon: data.usiaPohon,
            produksi_per_pohon: data.produksiPerPanen,
            produksi_per_panen: data.produksiPerPanen,
            target_kebun_pct: data.targetKebunPct,
            siklus_bulan: data.siklusBulan,
            hari_kerja_bulan: data.hariKerjaBulan,
            persentase_panen: data.persentasePanen,
            kebutuhan_pabrik: data.kebutuhanPabrikBulan,
            total_pohon: data.totalPohon,
            produksi_harian: data.totalProduksiHarian,
            supply_kebun_pct: data.coverageTotalPabrik
        };

        try {
            const res = await fetch('/api/simulations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            if (result.success) {
                showToast(`Skenario "${scenarioName}" berhasil disimpan ke SQLite!`);
                closeModal();
                loadSavedScenarios();
            } else {
                showToast(`Gagal menyimpan: ${result.error}`, 'danger');
            }
        } catch (err) {
            showToast(`Error menghubungi server API SQLite`, 'danger');
        }
    });

    // Load Saved Scenarios from SQLite API
    async function loadSavedScenarios() {
        elements.scenariosTableBody.innerHTML = `<tr><td colspan="11" class="text-center text-muted">Memuat skenario tersimpan...</td></tr>`;
        try {
            const res = await fetch('/api/simulations');
            const result = await res.json();
            if (result.success && result.data.length > 0) {
                renderScenariosTable(result.data);
            } else {
                elements.scenariosTableBody.innerHTML = `<tr><td colspan="11" class="text-center text-muted">Belum ada skenario yang tersimpan di SQLite.</td></tr>`;
            }
        } catch (err) {
            elements.scenariosTableBody.innerHTML = `<tr><td colspan="11" class="text-center text-amber">Gagal memuat data dari database SQLite.</td></tr>`;
        }
    }

    elements.btnRefreshScenarios.addEventListener('click', loadSavedScenarios);

    // Render Scenarios Table
    function renderScenariosTable(scenarios) {
        elements.scenariosTableBody.innerHTML = '';
        scenarios.forEach((item, index) => {
            const tr = document.createElement('tr');
            const dateStr = new Date(item.created_at).toLocaleString('id-ID', {
                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            const targetPct = item.target_kebun_pct || 10;
            const prodPanen = item.produksi_per_panen || item.produksi_per_pohon || 37.5;
            const hasilSiklus = (item.total_pohon * prodPanen) || 0;

            tr.innerHTML = `
                <td>${index + 1}</td>
                <td><strong>${escapeHtml(item.scenario_name)}</strong></td>
                <td>${formatNumber(item.luas_lahan)}</td>
                <td>${item.pohon_per_ha}</td>
                <td>${item.usia_pohon} thn</td>
                <td><span class="badge badge-info">${targetPct}%</span></td>
                <td class="text-emerald font-bold">${formatNumber(hasilSiklus)} btr</td>
                <td>${formatNumber(item.produksi_harian)} / HK</td>
                <td>${item.supply_kebun_pct.toFixed(1)}%</td>
                <td class="text-muted">${dateStr}</td>
                <td>
                    <div style="display:flex; gap:6px;">
                        <button class="btn btn-sm btn-load-sm" onclick="applyScenario(${item.id})">
                            <i data-lucide="upload-cloud"></i> Muat
                        </button>
                        <button class="btn btn-sm btn-danger-sm" onclick="deleteScenario(${item.id}, '${escapeHtml(item.scenario_name)}')">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </td>
            `;
            elements.scenariosTableBody.appendChild(tr);
        });

        window.savedScenariosCache = scenarios;
        if (window.lucide) lucide.createIcons();
    }

    // Global action: Apply Scenario to sliders
    window.applyScenario = function (id) {
        const item = (window.savedScenariosCache || []).find(s => s.id === id);
        if (!item) return;

        elements.luasLahanNum.value = item.luas_lahan;
        elements.luasLahanSlider.value = item.luas_lahan;
        updateSliderTrack(elements.luasLahanSlider);

        elements.pohonPerHaNum.value = item.pohon_per_ha;
        elements.pohonPerHaSlider.value = item.pohon_per_ha;
        updateSliderTrack(elements.pohonPerHaSlider);

        elements.usiaPohonNum.value = item.usia_pohon;
        elements.usiaPohonSlider.value = item.usia_pohon;
        updateSliderTrack(elements.usiaPohonSlider);

        const prodPanen = item.produksi_per_panen || item.produksi_per_pohon || 37.5;
        elements.produksiPerPohonNum.value = prodPanen;
        elements.produksiPerPohonSlider.value = prodPanen;
        updateSliderTrack(elements.produksiPerPohonSlider);

        const targetPct = item.target_kebun_pct || 10;
        elements.targetKebunPctNum.value = targetPct;
        elements.targetKebunPctSlider.value = targetPct;
        updateSliderTrack(elements.targetKebunPctSlider);

        elements.persentasePanenNum.value = item.persentase_panen || 100;
        elements.persentasePanenSlider.value = item.persentase_panen || 100;
        updateSliderTrack(elements.persentasePanenSlider);

        elements.hariKerjaNum.value = item.hari_kerja_bulan || 20;
        elements.kebutuhanPabrikNum.value = item.kebutuhan_pabrik || 8000000;

        recalculate();
        showToast(`Skenario "${item.scenario_name}" dimuat ke slider!`);
    };

    // Global action: Delete Scenario from SQLite DB
    window.deleteScenario = async function (id, name) {
        if (!confirm(`Hapus skenario "${name}" dari database SQLite?`)) return;

        try {
            const res = await fetch(`/api/simulations/${id}`, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) {
                showToast(`Skenario "${name}" berhasil dihapus.`);
                loadSavedScenarios();
            } else {
                showToast(`Gagal menghapus: ${result.error}`, 'danger');
            }
        } catch (err) {
            showToast(`Error menghubungi server API`, 'danger');
        }
    };

    // Toast Notification Helper
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = 'toast';
        if (type === 'danger') toast.style.borderColor = '#ef4444';
        toast.innerHTML = `<i data-lucide="${type === 'danger' ? 'alert-circle' : 'check-circle-2'}"></i> <span>${message}</span>`;
        elements.toastContainer.appendChild(toast);
        if (window.lucide) lucide.createIcons();

        setTimeout(() => {
            toast.remove();
        }, 3500);
    }

    // HTML escape utility
    function escapeHtml(str) {
        return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    // Initial load & calculation
    recalculate();
    loadSavedScenarios();
});
