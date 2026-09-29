document.addEventListener('DOMContentLoaded', () => {

    // Lucide icons initialization
    if (window.lucide) {
        lucide.createIcons();
    }

    // Global Defaults
    const GLOBAL_DEFAULTS = {
        targetKebunPct: 10,     // Target pasokan kebun internal (10% default)
        siklusBulan: 3,         // Panen per 3 bulan (4x / tahun)
        hariKerjaBulan: 20,     // 20 HK / bulan
        kebutuhanPabrikBulan: 8000000 // 8.000.000/bulan -> 96.000.000/tahun
    };

    // Initial Default Land Block
    const DEFAULT_BLOCK = {
        id: 'block_1',
        name: 'Blok 1 (Kebun TMC Eksisting)',
        luasLahan: 200,
        pohonPerHa: 80,
        usiaPohon: 10,
        produksiPerPanen: 37.5,
        persentasePanen: 100
    };

    // Application State
    let blocksArray = [ { ...DEFAULT_BLOCK } ];
    let supplyChart = null;

    // Palette Colors for Multi-Block Chart
    const CHART_COLORS = [
        '#10b981', // Emerald (Block 1)
        '#06b6d4', // Cyan (Block 2)
        '#a855f7', // Purple (Block 3)
        '#ec4899', // Pink (Block 4)
        '#3b82f6', // Blue (Block 5)
        '#f97316'  // Orange (Block 6)
    ];

    // DOM Elements - Global & Layout
    const elements = {
        targetKebunPctSlider: document.getElementById('targetKebunPctSlider'),
        targetKebunPctNum: document.getElementById('targetKebunPctNum'),
        hariKerjaNum: document.getElementById('hariKerjaNum'),
        kebutuhanPabrikNum: document.getElementById('kebutuhanPabrikNum'),

        blocksListContainer: document.getElementById('blocksListContainer'),
        btnAddBlock: document.getElementById('btnAddBlock'),
        btnAddBlockTop: document.getElementById('btnAddBlockTop'),

        // Target Gap Banner Elements
        gapAnalysisCard: document.getElementById('gapAnalysisCard'),
        gapStatusTitle: document.getElementById('gapStatusTitle'),
        gapStatusDesc: document.getElementById('gapStatusDesc'),

        // Badges & Labels
        lblKpiTargetKebunTitle: document.getElementById('lblKpiTargetKebunTitle'),
        lblKebutuhan3Bulan: document.getElementById('lblKebutuhan3Bulan'),
        lblKebutuhanTahunan: document.getElementById('lblKebutuhanTahunan'),
        lblTotalKebutuhanSiklus: document.getElementById('lblTotalKebutuhanSiklus'),

        // KPI Cards
        kpiTotalLuas: document.getElementById('kpiTotalLuas'),
        kpiTotalBlokSubtext: document.getElementById('kpiTotalBlokSubtext'),
        kpiProduksiSiklus: document.getElementById('kpiProduksiSiklus'),
        kpiProduksiHarianSubtext: document.getElementById('kpiProduksiHarianSubtext'),
        kpiTargetKebunVal: document.getElementById('kpiTargetKebunVal'),
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
        prevBlockCount: document.getElementById('prevBlockCount'),
        prevLuas: document.getElementById('prevLuas'),
        prevTotalPohon: document.getElementById('prevTotalPohon'),
        prevTargetPct: document.getElementById('prevTargetPct'),
        prevHasilPanen: document.getElementById('prevHasilPanen'),
        prevHasilHarian: document.getElementById('prevHasilHarian'),

        toastContainer: document.getElementById('toastContainer')
    };

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

    // Update Slider Track Color
    function updateSliderTrack(slider) {
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        const val = parseFloat(slider.value);
        const percentage = ((val - min) / (max - min)) * 100;
        slider.style.background = `linear-gradient(90deg, #10b981 ${percentage}%, rgba(255, 255, 255, 0.1) ${percentage}%)`;
    }

    // Setup Global Target Dual Binding
    function setupGlobalBinding(slider, numberInput) {
        slider.addEventListener('input', () => {
            numberInput.value = slider.value;
            updateSliderTrack(slider);
            recalculatePortfolio();
        });
        numberInput.addEventListener('input', () => {
            let val = parseFloat(numberInput.value) || 0;
            slider.value = val;
            updateSliderTrack(slider);
            recalculatePortfolio();
        });
        updateSliderTrack(slider);
    }

    setupGlobalBinding(elements.targetKebunPctSlider, elements.targetKebunPctNum);
    elements.hariKerjaNum.addEventListener('input', recalculatePortfolio);
    elements.kebutuhanPabrikNum.addEventListener('input', recalculatePortfolio);

    // Dynamic Multi-Block UI Renderer
    function renderBlocksUI() {
        elements.blocksListContainer.innerHTML = '';
        
        blocksArray.forEach((block, index) => {
            const blockCard = document.createElement('div');
            blockCard.className = 'block-card';
            blockCard.id = `card_${block.id}`;

            const ageInfo = getAgeFactor(block.usiaPohon);

            blockCard.innerHTML = `
                <div class="block-card-header">
                    <div class="block-title-area">
                        <div class="block-icon"><i data-lucide="map-pin"></i></div>
                        <input type="text" class="block-name-input" value="${escapeHtml(block.name)}" onchange="updateBlockField('${block.id}', 'name', this.value)">
                    </div>
                    ${blocksArray.length > 1 ? `
                        <button type="button" class="btn-delete-block" onclick="removeBlock('${block.id}')">
                            <i data-lucide="trash-2"></i> Hapus
                        </button>
                    ` : ''}
                </div>

                <div class="sliders-list">
                    <!-- Luas Lahan -->
                    <div class="form-group">
                        <div class="form-label-row">
                            <label><i data-lucide="map"></i> Luas Lahan Blok</label>
                            <div class="input-with-unit">
                                <input type="number" id="num_luas_${block.id}" min="1" max="10000" value="${block.luasLahan}">
                                <span>Ha</span>
                            </div>
                        </div>
                        <input type="range" id="slider_luas_${block.id}" min="10" max="5000" step="10" value="${block.luasLahan}" class="custom-slider">
                        <div class="slider-ticks">
                            <span>10 Ha</span>
                            <span>1.000 Ha</span>
                            <span>5.000 Ha</span>
                        </div>
                    </div>

                    <!-- Pohon per Ha -->
                    <div class="form-group">
                        <div class="form-label-row">
                            <label><i data-lucide="grid"></i> Kepadatan Pohon per Ha</label>
                            <div class="input-with-unit">
                                <input type="number" id="num_density_${block.id}" min="10" max="300" value="${block.pohonPerHa}">
                                <span>Pohon</span>
                            </div>
                        </div>
                        <input type="range" id="slider_density_${block.id}" min="40" max="150" step="1" value="${block.pohonPerHa}" class="custom-slider">
                    </div>

                    <!-- Usia Pohon -->
                    <div class="form-group">
                        <div class="form-label-row">
                            <label><i data-lucide="calendar"></i> Usia Rata-rata Pohon</label>
                            <div class="input-with-unit">
                                <input type="number" id="num_usia_${block.id}" min="1" max="40" value="${block.usiaPohon}">
                                <span>Thn</span>
                            </div>
                        </div>
                        <input type="range" id="slider_usia_${block.id}" min="1" max="35" step="1" value="${block.usiaPohon}" class="custom-slider">
                        <div class="age-factor-badge" id="badge_usia_${block.id}">
                            <i data-lucide="shield-check"></i> Status: ${ageInfo.label} (${ageInfo.pct})
                        </div>
                    </div>

                    <!-- Produksi per Pohon / Panen -->
                    <div class="form-group">
                        <div class="form-label-row">
                            <label><i data-lucide="sparkles"></i> Produksi / Pohon / Panen (3 Bln)</label>
                            <div class="input-with-unit">
                                <input type="number" id="num_yield_${block.id}" min="1" max="100" step="0.5" value="${block.produksiPerPanen}">
                                <span>Btr</span>
                            </div>
                        </div>
                        <input type="range" id="slider_yield_${block.id}" min="5" max="80" step="0.5" value="${block.produksiPerPanen}" class="custom-slider">
                    </div>
                </div>
            `;

            elements.blocksListContainer.appendChild(blockCard);

            // Bind Event Listeners for this Block
            bindBlockSlider(block.id, 'luas', 'luasLahan');
            bindBlockSlider(block.id, 'density', 'pohonPerHa');
            bindBlockSlider(block.id, 'usia', 'usiaPohon');
            bindBlockSlider(block.id, 'yield', 'produksiPerPanen');
        });

        if (window.lucide) lucide.createIcons();
        recalculatePortfolio();
    }

    // Bind dual input/slider for individual Block
    function bindBlockSlider(blockId, fieldKey, stateProp) {
        const slider = document.getElementById(`slider_${fieldKey}_${blockId}`);
        const numInput = document.getElementById(`num_${fieldKey}_${blockId}`);
        const block = blocksArray.find(b => b.id === blockId);

        if (!slider || !numInput || !block) return;

        function updateStateVal(val) {
            block[stateProp] = parseFloat(val) || 0;
            updateSliderTrack(slider);

            // Update badge usia if field is usia
            if (fieldKey === 'usia') {
                const badge = document.getElementById(`badge_usia_${blockId}`);
                const ageInfo = getAgeFactor(block.usiaPohon);
                if (badge) {
                    badge.innerHTML = `<i data-lucide="shield-check"></i> Status: ${ageInfo.label} (${ageInfo.pct})`;
                    if (window.lucide) lucide.createIcons();
                }
            }
            recalculatePortfolio();
        }

        slider.addEventListener('input', () => {
            numInput.value = slider.value;
            updateStateVal(slider.value);
        });

        numInput.addEventListener('input', () => {
            slider.value = numInput.value;
            updateStateVal(numInput.value);
        });

        updateSliderTrack(slider);
    }

    // Add Block
    function addBlock() {
        const newId = `block_${Date.now()}`;
        const blockNum = blocksArray.length + 1;
        const newBlock = {
            id: newId,
            name: `Blok ${blockNum} (Lahan Ekspansi)`,
            luasLahan: 300,
            pohonPerHa: 80,
            usiaPohon: 10,
            produksiPerPanen: 37.5,
            persentasePanen: 100
        };
        blocksArray.push(newBlock);
        renderBlocksUI();
        showToast(`Blok baru "${newBlock.name}" berhasil ditambahkan!`);
    }

    elements.btnAddBlock.addEventListener('click', addBlock);
    elements.btnAddBlockTop.addEventListener('click', addBlock);

    // Global field updater
    window.updateBlockField = function (blockId, fieldProp, value) {
        const block = blocksArray.find(b => b.id === blockId);
        if (block) {
            block[fieldProp] = value;
            recalculatePortfolio();
        }
    };

    // Remove Block
    window.removeBlock = function (blockId) {
        if (blocksArray.length <= 1) {
            showToast('Simulasi minimal harus memiliki 1 blok lahan!', 'danger');
            return;
        }
        const block = blocksArray.find(b => b.id === blockId);
        const name = block ? block.name : 'Blok';
        blocksArray = blocksArray.filter(b => b.id !== blockId);
        renderBlocksUI();
        showToast(`"${name}" berhasil dihapus.`);
    };

    // Main Portfolio Recalculator
    function calculatePortfolioData() {
        const targetKebunPct = parseFloat(elements.targetKebunPctNum.value) || 10;
        const hariKerjaBulan = parseInt(elements.hariKerjaNum.value) || 20;
        const kebutuhanPabrikBulan = parseFloat(elements.kebutuhanPabrikNum.value) || 8000000;
        const siklusBulan = GLOBAL_DEFAULTS.siklusBulan; // 3 bulan

        const kebutuhanPabrikSiklus = kebutuhanPabrikBulan * 3; // 24.000.000 per 3 bulan
        const kebutuhanPabrikHarian = hariKerjaBulan > 0 ? (kebutuhanPabrikBulan / hariKerjaBulan) : 0; // 400.000 / HK
        const kebutuhanPabrikTahunan = kebutuhanPabrikBulan * 12; // 96.000.000 / tahun

        const targetKebunSiklus = kebutuhanPabrikSiklus * (targetKebunPct / 100);
        const targetKebunHarian = kebutuhanPabrikHarian * (targetKebunPct / 100);
        const targetKebunTahunan = kebutuhanPabrikTahunan * (targetKebunPct / 100);

        let totalLuas = 0;
        let totalPohon = 0;
        let totalProduksiTahunan = 0;

        const blockDetails = blocksArray.map(block => {
            const ageInfo = getAgeFactor(block.usiaPohon);
            const blockPohon = block.luasLahan * block.pohonPerHa;
            const frekuensiPanenPerTahun = 12 / siklusBulan;
            const yieldAnnualPerTree = block.produksiPerPanen * frekuensiPanenPerTahun * ageInfo.factor;
            const blockProduksiTahunan = blockPohon * yieldAnnualPerTree * (block.persentasePanen / 100);
            const blockProduksiSiklus = blockProduksiTahunan / 4; // per 3 bulan
            const blockProduksiHarian = blockProduksiTahunan / (hariKerjaBulan * 12);

            totalLuas += block.luasLahan;
            totalPohon += blockPohon;
            totalProduksiTahunan += blockProduksiTahunan;

            return {
                ...block,
                blockPohon,
                blockProduksiSiklus,
                blockProduksiTahunan,
                blockProduksiHarian
            };
        });

        const totalProduksiSiklus = totalProduksiTahunan / 4;
        const totalProduksiBulanan = totalProduksiTahunan / 12;
        const totalProduksiHarian = totalProduksiTahunan / (hariKerjaBulan * 12);

        const coverageTargetKebun = targetKebunSiklus > 0 ? (totalProduksiSiklus / targetKebunSiklus) * 100 : 0;
        const coverageTotalPabrik = kebutuhanPabrikSiklus > 0 ? (totalProduksiSiklus / kebutuhanPabrikSiklus) * 100 : 0;

        const pembelianLuarHarian = Math.max(0, kebutuhanPabrikHarian - totalProduksiHarian);
        const pembelianLuarBulanan = Math.max(0, kebutuhanPabrikBulan - totalProduksiBulanan);
        const pembelianLuarSiklus = Math.max(0, kebutuhanPabrikSiklus - totalProduksiSiklus);
        const pembelianLuarTahunan = Math.max(0, kebutuhanPabrikTahunan - totalProduksiTahunan);

        // Gap Analysis (Berapa Ha atau Butir lagi yang dibutuhkan untuk capai Target Kebun)
        const gapSiklus = targetKebunSiklus - totalProduksiSiklus;
        const avgYieldTahunanPerHa = totalLuas > 0 ? (totalProduksiTahunan / totalLuas) : 0;
        const gapLuasHa = avgYieldTahunanPerHa > 0 ? (gapSiklus * 4) / avgYieldTahunanPerHa : 0;

        return {
            targetKebunPct,
            hariKerjaBulan,
            kebutuhanPabrikBulan,
            kebutuhanPabrikSiklus,
            kebutuhanPabrikHarian,
            kebutuhanPabrikTahunan,
            targetKebunSiklus,
            targetKebunHarian,
            targetKebunTahunan,
            totalLuas,
            totalPohon,
            blockDetails,
            totalProduksiSiklus,
            totalProduksiTahunan,
            totalProduksiBulanan,
            totalProduksiHarian,
            coverageTargetKebun,
            coverageTotalPabrik,
            pembelianLuarHarian,
            pembelianLuarBulanan,
            pembelianLuarSiklus,
            pembelianLuarTahunan,
            gapSiklus,
            gapLuasHa
        };
    }

    // Recalculate Portfolio UI Refresh
    function recalculatePortfolio() {
        const data = calculatePortfolioData();

        // Update Labels & Titles
        elements.lblKpiTargetKebunTitle.textContent = `Target Pasokan Kebun (${data.targetKebunPct}%)`;
        elements.lblKebutuhan3Bulan.textContent = formatNumber(data.kebutuhanPabrikSiklus);
        elements.lblKebutuhanTahunan.textContent = formatNumber(data.kebutuhanPabrikTahunan);
        elements.lblTotalKebutuhanSiklus.textContent = formatNumber(data.kebutuhanPabrikSiklus);

        // KPI Cards
        elements.kpiTotalLuas.textContent = `${formatNumber(data.totalLuas)} Ha`;
        elements.kpiTotalBlokSubtext.textContent = `${blocksArray.length} Blok Lahan Terdaftar (${formatNumber(data.totalPohon)} Pohon)`;

        elements.kpiProduksiSiklus.textContent = `${formatNumber(data.totalProduksiSiklus)}`;
        elements.kpiProduksiHarianSubtext.textContent = `${formatNumber(data.totalProduksiHarian)} Butir / HK (Rata-rata)`;

        elements.kpiTargetKebunVal.textContent = `${formatNumber(data.targetKebunHarian)}`;
        elements.kpiCoverageKebun.textContent = `Aktual: ${formatNumber(data.totalProduksiHarian)} / HK (${data.coverageTargetKebun.toFixed(1)}% tercapai)`;

        elements.kpiPembelianLuarSiklus.textContent = `${formatNumber(data.pembelianLuarSiklus)}`;

        // Progress Gauge & Marker Position
        const progressPct = Math.min(100, data.coverageTotalPabrik);
        elements.kebunProgressBar.style.width = `${progressPct}%`;

        const markerPosPct = Math.min(100, Math.max(1, data.targetKebunPct));
        elements.progressTargetMarker.style.left = `${markerPosPct}%`;
        elements.markerLabel.textContent = `Target ${data.targetKebunPct}%`;

        elements.lblPercentTercapai.textContent = `${data.coverageTotalPabrik.toFixed(1)}% tercover dari kebun sendiri (${formatNumber(data.totalProduksiSiklus)} / ${formatNumber(data.kebutuhanPabrikSiklus)} per 3 bulan)`;

        // Target Gap Banner Update
        if (data.gapSiklus <= 0) {
            elements.gapAnalysisCard.className = 'card gap-analysis-card mb-4';
            elements.gapStatusTitle.innerHTML = `<i data-lucide="check-circle-2"></i> Target Pasokan Kebun Terpenuhi! 🎉`;
            elements.gapStatusDesc.textContent = `Total portofolio (${formatNumber(data.totalLuas)} Ha) menghasilkan ${formatNumber(data.totalProduksiSiklus)} butir per 3 bulan, melampaui target kebun ${data.targetKebunPct}% (${formatNumber(data.targetKebunSiklus)} butir).`;
        } else {
            elements.gapAnalysisCard.className = 'card gap-analysis-card status-warning mb-4';
            elements.gapStatusTitle.innerHTML = `<i data-lucide="alert-triangle"></i> Sisa Kekurangan untuk Mencapai Target Kebun (${data.targetKebunPct}%)`;
            elements.gapStatusDesc.textContent = `Masih kurang ${formatNumber(data.gapSiklus)} butir per 3 bulan (${formatNumber(data.gapSiklus / 60)} butir/HK). Membutuhkan tambahan lahan sekitar +${formatNumber(data.gapLuasHa)} Ha untuk mencapai target!`;
        }

        // Table Breakdown Updates
        elements.tblProduksiHarian.textContent = formatNumber(data.totalProduksiHarian);
        elements.tblBeliHarian.textContent = formatNumber(data.pembelianLuarHarian);
        elements.tblTotalHarian.textContent = formatNumber(data.kebutuhanPabrikHarian);

        elements.tblProduksiBulanan.textContent = formatNumber(data.totalProduksiBulanan);
        elements.tblBeliBulanan.textContent = formatNumber(data.pembelianLuarBulanan);
        elements.tblTotalBulanan.textContent = formatNumber(data.kebutuhanPabrikBulan);

        elements.tblProduksiSiklus.textContent = formatNumber(data.totalProduksiSiklus);
        elements.tblBeliSiklus.textContent = formatNumber(data.pembelianLuarSiklus);
        elements.tblTotalSiklus.textContent = formatNumber(data.kebutuhanPabrikSiklus);

        elements.tblProduksiTahunan.textContent = formatNumber(data.totalProduksiTahunan);
        elements.tblBeliTahunan.textContent = formatNumber(data.pembelianLuarTahunan);
        elements.tblTotalTahunan.textContent = formatNumber(data.kebutuhanPabrikTahunan);

        if (window.lucide) lucide.createIcons();
        updateMultiBlockChart(data);
    }

    // Chart.js initialization & update per Block
    function updateMultiBlockChart(data) {
        const ctx = document.getElementById('supplyChart').getContext('2d');

        const blockLabels = data.blockDetails.map(b => b.name);
        const blockValues = data.blockDetails.map(b => Math.round(b.blockProduksiSiklus));

        const labels = [...blockLabels, 'Pembelian dari Luar'];
        const values = [...blockValues, Math.round(data.pembelianLuarSiklus)];

        const colors = [
            ...data.blockDetails.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
            '#f59e0b' // Amber for External Purchase
        ];

        if (!supplyChart) {
            supplyChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: colors,
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
            supplyChart.data.labels = labels;
            supplyChart.data.datasets[0].data = values;
            supplyChart.data.datasets[0].backgroundColor = colors;
            supplyChart.update();
        }
    }

    // Reset to Defaults
    elements.btnResetDefault.addEventListener('click', () => {
        blocksArray = [ { ...DEFAULT_BLOCK } ];
        elements.targetKebunPctNum.value = GLOBAL_DEFAULTS.targetKebunPct;
        elements.targetKebunPctSlider.value = GLOBAL_DEFAULTS.targetKebunPct;
        updateSliderTrack(elements.targetKebunPctSlider);

        elements.hariKerjaNum.value = GLOBAL_DEFAULTS.hariKerjaBulan;
        elements.kebutuhanPabrikNum.value = GLOBAL_DEFAULTS.kebutuhanPabrikBulan;

        renderBlocksUI();
        showToast('Parameter dikembalikan ke 1 Blok default (200 Ha)!');
    });

    // Save Modal Handling
    elements.btnOpenSaveModal.addEventListener('click', () => {
        const data = calculatePortfolioData();
        elements.prevBlockCount.textContent = `${blocksArray.length} Blok Lahan`;
        elements.prevLuas.textContent = `${formatNumber(data.totalLuas)} Ha`;
        elements.prevTotalPohon.textContent = `${formatNumber(data.totalPohon)} Pohon`;
        elements.prevTargetPct.textContent = `${data.targetKebunPct}%`;
        elements.prevHasilPanen.textContent = `${formatNumber(data.totalProduksiSiklus)} Butir`;
        elements.prevHasilHarian.textContent = `${formatNumber(data.totalProduksiHarian)} Butir/HK`;

        elements.scenarioNameInput.value = `Skenario ${blocksArray.length} Blok (${formatNumber(data.totalLuas)} Ha) - ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
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

        const data = calculatePortfolioData();
        const payload = {
            scenario_name: scenarioName,
            luas_lahan: data.totalLuas,
            pohon_per_ha: data.totalLuas > 0 ? Math.round(data.totalPohon / data.totalLuas) : 80,
            usia_pohon: blocksArray[0]?.usiaPohon || 10,
            produksi_per_pohon: blocksArray[0]?.produksiPerPanen || 37.5,
            produksi_per_panen: blocksArray[0]?.produksiPerPanen || 37.5,
            target_kebun_pct: data.targetKebunPct,
            siklus_bulan: GLOBAL_DEFAULTS.siklusBulan,
            hari_kerja_bulan: data.hariKerjaBulan,
            persentase_panen: 100,
            kebutuhan_pabrik: data.kebutuhanPabrikBulan,
            total_pohon: data.totalPohon,
            produksi_harian: data.totalProduksiHarian,
            supply_kebun_pct: data.coverageTotalPabrik,
            blocks_json: JSON.stringify(blocksArray)
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

            let blockCount = 1;
            if (item.blocks_json) {
                try {
                    const parsed = JSON.parse(item.blocks_json);
                    if (Array.isArray(parsed)) blockCount = parsed.length;
                } catch (e) {}
            }

            const targetPct = item.target_kebun_pct || 10;
            const totalLuas = item.luas_lahan || 200;
            const hasilSiklus = (item.produksi_harian * 60) || 0;

            tr.innerHTML = `
                <td>${index + 1}</td>
                <td><strong>${escapeHtml(item.scenario_name)}</strong></td>
                <td>${formatNumber(totalLuas)}</td>
                <td>${item.pohon_per_ha || 80}</td>
                <td><span class="badge badge-info">${blockCount} Blok</span></td>
                <td><span class="badge badge-success">${targetPct}%</span></td>
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

    // Global action: Apply Scenario (reconstructs all blocks!)
    window.applyScenario = function (id) {
        const item = (window.savedScenariosCache || []).find(s => s.id === id);
        if (!item) return;

        if (item.blocks_json) {
            try {
                const parsed = JSON.parse(item.blocks_json);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    blocksArray = parsed;
                } else {
                    blocksArray = [{
                        id: 'block_1',
                        name: 'Blok 1 (Kebun TMC)',
                        luasLahan: item.luas_lahan || 200,
                        pohonPerHa: item.pohon_per_ha || 80,
                        usiaPohon: item.usia_pohon || 10,
                        produksiPerPanen: item.produksi_per_panen || 37.5,
                        persentasePanen: item.persentase_panen || 100
                    }];
                }
            } catch (e) {
                blocksArray = [{
                    id: 'block_1',
                    name: 'Blok 1 (Kebun TMC)',
                    luasLahan: item.luas_lahan || 200,
                    pohonPerHa: item.pohon_per_ha || 80,
                    usiaPohon: item.usia_pohon || 10,
                    produksiPerPanen: item.produksi_per_panen || 37.5,
                    persentasePanen: item.persentase_panen || 100
                }];
            }
        } else {
            blocksArray = [{
                id: 'block_1',
                name: 'Blok 1 (Kebun TMC)',
                luasLahan: item.luas_lahan || 200,
                pohonPerHa: item.pohon_per_ha || 80,
                usiaPohon: item.usia_pohon || 10,
                produksiPerPanen: item.produksi_per_panen || 37.5,
                persentasePanen: item.persentase_panen || 100
            }];
        }

        const targetPct = item.target_kebun_pct || 10;
        elements.targetKebunPctNum.value = targetPct;
        elements.targetKebunPctSlider.value = targetPct;
        updateSliderTrack(elements.targetKebunPctSlider);

        elements.hariKerjaNum.value = item.hari_kerja_bulan || 20;
        elements.kebutuhanPabrikNum.value = item.kebutuhan_pabrik || 8000000;

        renderBlocksUI();
        showToast(`Skenario "${item.scenario_name}" dimuat!`);
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
    renderBlocksUI();
    loadSavedScenarios();
});
