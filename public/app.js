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
        pohonPerHa: 50,
        usiaPohon: 10,
        produksiPerPanen: 20,
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

        // Total Portfolio Banner Elements
        lblTotalBlokCountBadge: document.getElementById('lblTotalBlokCountBadge'),
        lblTotalLuasBanner: document.getElementById('lblTotalLuasBanner'),
        lblTotalPohonBanner: document.getElementById('lblTotalPohonBanner'),
        lblTotalHasil3bBanner: document.getElementById('lblTotalHasil3bBanner'),
        lblTotalPasokanHarianBanner: document.getElementById('lblTotalPasokanHarianBanner'),

        // Badges & Labels
        lblKpiTargetKebunTitle: document.getElementById('lblKpiTargetKebunTitle'),
        lblTotalKebutuhanSiklus: document.getElementById('lblTotalKebutuhanSiklus'),

        // KPI Cards
        kpiTotalLuas: document.getElementById('kpiTotalLuas'),
        kpiTotalBlokSubtext: document.getElementById('kpiTotalBlokSubtext'),
        kpiProduksiSiklus: document.getElementById('kpiProduksiSiklus'),
        kpiProduksiHarianSubtext: document.getElementById('kpiProduksiHarianSubtext'),
        kpiTargetKebunVal: document.getElementById('kpiTargetKebunVal'),
        kpiCoverageKebun: document.getElementById('kpiCoverageKebun'),
        kpiPembelianLuarSiklus: document.getElementById('kpiPembelianLuarSiklus'),
        kpiPembelianLuarSubtext: document.getElementById('kpiPembelianLuarSubtext'),

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
        if (usia <= 3) return { factor: 0.0, label: 'TBM (Belum Berbuah)', pct: '0%' };
        if (usia === 4) return { factor: 0.40, label: 'TM 1 (Mulai Berbuah)', pct: '40%' };
        if (usia === 5) return { factor: 0.65, label: 'TM 2 (Berkembang)', pct: '65%' };
        if (usia === 6) return { factor: 0.85, label: 'TM 3 (Mendekati Puncak)', pct: '85%' };
        if (usia >= 7 && usia <= 20) return { factor: 1.00, label: 'Produksi Puncak', pct: '100%' };
        if (usia >= 21 && usia <= 25) return { factor: 0.90, label: 'TM Tua 1 (Penurunan)', pct: '90%' };
        if (usia >= 26 && usia <= 30) return { factor: 0.80, label: 'TM Tua 2 (Penurunan)', pct: '80%' };
        return { factor: 0.70, label: 'TM Tua 3 (Penurunan)', pct: '70%' };
    }

    // Number Formatter
    function formatNumber(num) {
        return new Intl.NumberFormat('id-ID').format(Math.round(num));
    }

    // Update Slider Track Color
    function updateSliderTrack(slider) {
        const min = parseFloat(slider.min) || 0;
        const max = parseFloat(slider.max) || 100;
        const val = parseFloat(slider.value) || 0;
        const percentage = Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
        slider.style.background = `linear-gradient(90deg, #10b981 ${percentage}%, rgba(255, 255, 255, 0.1) ${percentage}%)`;
    }

    // Setup Global Target Dual Binding
    function setupGlobalBinding(slider, numberInput) {
        slider.addEventListener('input', () => {
            numberInput.value = slider.value;
            updateSliderTrack(slider);
            recalculatePortfolio();
        });
        ['input', 'change', 'keyup'].forEach(evt => {
            numberInput.addEventListener(evt, () => {
                let val = parseFloat(numberInput.value);
                if (!isNaN(val)) {
                    slider.value = val;
                    updateSliderTrack(slider);
                    recalculatePortfolio();
                }
            });
        });
        updateSliderTrack(slider);
    }

    setupGlobalBinding(elements.targetKebunPctSlider, elements.targetKebunPctNum);
    ['input', 'change', 'keyup'].forEach(evt => {
        elements.hariKerjaNum.addEventListener(evt, recalculatePortfolio);
        elements.kebutuhanPabrikNum.addEventListener(evt, recalculatePortfolio);
    });

    // Synchronize ALL live DOM inputs back into blocksArray state
    function syncDOMToState() {
        blocksArray.forEach(block => {
            const card = document.getElementById(`card_${block.id}`);
            if (!card) return;

            const nameInput = document.getElementById(`input_name_${block.id}`) || card.querySelector('.block-name-input');
            if (nameInput && nameInput.value.trim() !== '') {
                block.name = nameInput.value.trim();
            }

            const luasInput = document.getElementById(`num_luas_${block.id}`);
            if (luasInput && !isNaN(parseFloat(luasInput.value))) {
                block.luasLahan = parseFloat(luasInput.value);
            }

            const densityInput = document.getElementById(`num_density_${block.id}`);
            if (densityInput && !isNaN(parseFloat(densityInput.value))) {
                block.pohonPerHa = parseFloat(densityInput.value);
            }

            const usiaInput = document.getElementById(`num_usia_${block.id}`);
            if (usiaInput && !isNaN(parseFloat(usiaInput.value))) {
                block.usiaPohon = parseFloat(usiaInput.value);
            }

            const yieldInput = document.getElementById(`num_yield_${block.id}`);
            if (yieldInput && !isNaN(parseFloat(yieldInput.value))) {
                block.produksiPerPanen = parseFloat(yieldInput.value);
            }
        });
    }

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
                        <div class="block-name-wrapper">
                            <i data-lucide="edit-3" class="edit-icon-hint"></i>
                            <input type="text" id="input_name_${block.id}" class="block-name-input" value="${escapeHtml(block.name)}" placeholder="Nama Blok Lahan..." title="Klik untuk mengubah nama blok (terhubung database)">
                        </div>
                    </div>
                    ${blocksArray.length > 1 ? `
                        <button type="button" class="btn-delete-block" onclick="removeBlock('${block.id}')">
                            <i data-lucide="trash-2"></i> Hapus
                        </button>
                    ` : ''}
                </div>

                <div class="block-sliders-grid">
                    <!-- Luas Lahan -->
                    <div class="form-group">
                        <div class="form-label-row">
                            <label><i data-lucide="map"></i> Luas Lahan Blok</label>
                            <div class="input-with-unit">
                                <input type="number" id="num_luas_${block.id}" min="10" max="10000" value="${block.luasLahan}">
                                <span>Ha</span>
                            </div>
                        </div>
                        <input type="range" id="slider_luas_${block.id}" min="10" max="10000" step="10" value="${block.luasLahan}" class="custom-slider">
                        <div class="slider-ticks">
                            <span>10 Ha</span>
                            <span>5.000 Ha</span>
                            <span>10.000 Ha</span>
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
                        <input type="range" id="slider_density_${block.id}" min="10" max="300" step="1" value="${block.pohonPerHa}" class="custom-slider">
                        <div class="slider-ticks">
                            <span>10 Pohon</span>
                            <span>150 Pohon</span>
                            <span>300 Pohon</span>
                        </div>
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
                        <input type="range" id="slider_usia_${block.id}" min="1" max="40" step="1" value="${block.usiaPohon}" class="custom-slider">
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
                        <input type="range" id="slider_yield_${block.id}" min="1" max="100" step="0.5" value="${block.produksiPerPanen}" class="custom-slider">
                        <div class="slider-ticks">
                            <span>1 Btr</span>
                            <span>50 Btr</span>
                            <span>100 Btr</span>
                        </div>
                    </div>
                </div>

                <!-- LIVE SUMMARY BOX INSIDE BLOCK CARD -->
                <div class="block-summary-box">
                    <div class="block-summary-item">
                        <span class="block-summary-label">Populasi Pohon</span>
                        <span class="block-summary-val" id="summary_trees_${block.id}">0 Pohon</span>
                    </div>
                    <div class="block-summary-item">
                        <span class="block-summary-label">Hasil / 3 Bulan (Siklus Panen)</span>
                        <span class="block-summary-val highlight-emerald" id="summary_yield3b_${block.id}">0 Btr</span>
                    </div>
                    <div class="block-summary-item">
                        <span class="block-summary-label">Pasokan Harian (Pabrik)</span>
                        <span class="block-summary-val" id="summary_yielddaily_${block.id}">0 Btr/HK</span>
                    </div>
                </div>
            `;

            elements.blocksListContainer.appendChild(blockCard);

            // Bind Event Listeners for this Block Sliders & Numbers
            bindBlockSlider(block.id, 'luas', 'luasLahan');
            bindBlockSlider(block.id, 'density', 'pohonPerHa');
            bindBlockSlider(block.id, 'usia', 'usiaPohon');
            bindBlockSlider(block.id, 'yield', 'produksiPerPanen');

            // Dynamic live binding for Block Name
            const nameInput = blockCard.querySelector(`#input_name_${block.id}`);
            if (nameInput) {
                ['input', 'change', 'keyup', 'blur'].forEach(evt => {
                    nameInput.addEventListener(evt, () => {
                        block.name = nameInput.value.trim() || block.name;
                        recalculatePortfolio();
                    });
                });
            }
        });

        if (window.lucide) lucide.createIcons();
        recalculatePortfolio();
    }

    // Bind dual input/slider for individual Block
    function bindBlockSlider(blockId, fieldKey, stateProp) {
        const slider = document.getElementById(`slider_${fieldKey}_${blockId}`);
        const numInput = document.getElementById(`num_${fieldKey}_${blockId}`);

        if (!slider || !numInput) return;

        function updateStateVal(val, fromInput = false) {
            const block = blocksArray.find(b => b.id === blockId);
            if (!block) return;

            const parsed = parseFloat(val);
            if (isNaN(parsed)) return;

            block[stateProp] = parsed;

            if (!fromInput) {
                numInput.value = parsed;
            } else {
                slider.value = parsed;
            }

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
            updateStateVal(slider.value, false);
        });

        ['input', 'change', 'keyup'].forEach(evt => {
            numInput.addEventListener(evt, () => {
                updateStateVal(numInput.value, true);
            });
        });

        updateSliderTrack(slider);
    }

    // Add Block
    function addBlock() {
        syncDOMToState();
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
        syncDOMToState();
        const block = blocksArray.find(b => b.id === blockId);
        const name = block ? block.name : 'Blok';
        blocksArray = blocksArray.filter(b => b.id !== blockId);
        renderBlocksUI();
        showToast(`"${name}" berhasil dihapus.`);
    };

    // Main Portfolio Recalculator
    function calculatePortfolioData() {
        const targetKebunPct = parseFloat(elements.targetKebunPctNum?.value) || 10;
        const hariKerjaBulan = parseInt(elements.hariKerjaNum?.value) || 20;
        const kebutuhanPabrikBulan = parseFloat(elements.kebutuhanPabrikNum?.value) || 8000000;
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
        let totalProduksiSiklus = 0;

        const blockDetails = blocksArray.map(block => {
            const luas = parseFloat(block.luasLahan) || 0;
            const density = parseFloat(block.pohonPerHa) || 0;
            const usia = parseFloat(block.usiaPohon) || 10;
            const yieldPanen = parseFloat(block.produksiPerPanen) || 0;
            const pctPanen = parseFloat(block.persentasePanen) || 100;

            const ageInfo = getAgeFactor(usia);
            const blockPohon = Math.round(luas * density);
            
            // Formula Produksi per Siklus Panen (3 Bulan) per blok:
            // Populasi Pohon * Produksi/Pohon/Panen * Age Factor * (% Panen / 100)
            const blockProduksiSiklus = Math.round(blockPohon * yieldPanen * ageInfo.factor * (pctPanen / 100));
            
            // Produksi Tahunan (4 kali siklus panen per tahun)
            const blockProduksiTahunan = blockProduksiSiklus * (12 / siklusBulan);
            
            // Produksi Harian (60 HK per siklus 3 bulan)
            const totalHkSiklus = hariKerjaBulan * 3;
            const blockProduksiHarian = totalHkSiklus > 0 ? (blockProduksiSiklus / totalHkSiklus) : 0;

            totalLuas += luas;
            totalPohon += blockPohon;
            totalProduksiSiklus += blockProduksiSiklus;
            totalProduksiTahunan += blockProduksiTahunan;

            // Live Update inner block card summary box
            const treesEl = document.getElementById(`summary_trees_${block.id}`);
            const yield3bEl = document.getElementById(`summary_yield3b_${block.id}`);
            const yieldDailyEl = document.getElementById(`summary_yielddaily_${block.id}`);

            if (treesEl) treesEl.textContent = `${formatNumber(blockPohon)} Pohon`;
            if (yield3bEl) yield3bEl.textContent = `${formatNumber(blockProduksiSiklus)} Btr`;
            if (yieldDailyEl) yieldDailyEl.textContent = `${formatNumber(blockProduksiHarian)} Btr/HK`;

            return {
                ...block,
                blockPohon,
                blockProduksiSiklus,
                blockProduksiTahunan,
                blockProduksiHarian
            };
        });

        const totalProduksiBulanan = totalProduksiTahunan / 12;
        const totalProduksiHarian = totalProduksiTahunan / (hariKerjaBulan * 12);

        const coverageTargetKebun = targetKebunSiklus > 0 ? (totalProduksiSiklus / targetKebunSiklus) * 100 : 0;
        const coverageTotalPabrik = kebutuhanPabrikSiklus > 0 ? (totalProduksiSiklus / kebutuhanPabrikSiklus) * 100 : 0;

        const pembelianLuarHarian = Math.max(0, kebutuhanPabrikHarian - totalProduksiHarian);
        const pembelianLuarBulanan = Math.max(0, kebutuhanPabrikBulan - totalProduksiBulanan);
        const pembelianLuarSiklus = Math.max(0, kebutuhanPabrikSiklus - totalProduksiSiklus);
        const pembelianLuarTahunan = Math.max(0, kebutuhanPabrikTahunan - totalProduksiTahunan);

        // Gap Analysis
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

        // Total Portfolio Live Banner Updates
        if (elements.lblTotalBlokCountBadge) elements.lblTotalBlokCountBadge.textContent = `${blocksArray.length} Blok Terdaftar`;
        if (elements.lblTotalLuasBanner) elements.lblTotalLuasBanner.textContent = `${formatNumber(data.totalLuas)} Ha`;
        if (elements.lblTotalPohonBanner) elements.lblTotalPohonBanner.textContent = `${formatNumber(data.totalPohon)} Pohon`;
        if (elements.lblTotalHasil3bBanner) elements.lblTotalHasil3bBanner.textContent = `${formatNumber(data.totalProduksiSiklus)} Butir`;
        if (elements.lblTotalPasokanHarianBanner) elements.lblTotalPasokanHarianBanner.textContent = `${formatNumber(data.totalProduksiHarian)} Btr/HK`;

        // Update Labels & Titles
        if (elements.lblKpiTargetKebunTitle) elements.lblKpiTargetKebunTitle.textContent = `Target Pasokan Kebun (${data.targetKebunPct}%)`;
        if (elements.lblTotalKebutuhanSiklus) elements.lblTotalKebutuhanSiklus.textContent = formatNumber(data.kebutuhanPabrikSiklus);

        // KPI Cards Update
        if (elements.kpiTotalLuas) elements.kpiTotalLuas.textContent = `${formatNumber(data.totalLuas)} Ha`;
        if (elements.kpiTotalBlokSubtext) elements.kpiTotalBlokSubtext.textContent = `${blocksArray.length} Blok Lahan Terdaftar (${formatNumber(data.totalPohon)} Pohon)`;

        if (elements.kpiProduksiSiklus) elements.kpiProduksiSiklus.textContent = `${formatNumber(data.totalProduksiSiklus)}`;
        if (elements.kpiProduksiHarianSubtext) elements.kpiProduksiHarianSubtext.textContent = `${formatNumber(data.totalProduksiHarian)} Butir / HK (Rata-rata)`;

        if (elements.kpiTargetKebunVal) elements.kpiTargetKebunVal.textContent = `${formatNumber(data.targetKebunSiklus)}`;
        if (elements.kpiCoverageKebun) elements.kpiCoverageKebun.textContent = `Target: ${formatNumber(data.targetKebunHarian)}/HK | Aktual: ${formatNumber(data.totalProduksiHarian)}/HK (${data.coverageTargetKebun.toFixed(1)}% tercapai)`;

        if (elements.kpiPembelianLuarSiklus) elements.kpiPembelianLuarSiklus.textContent = `${formatNumber(data.pembelianLuarSiklus)}`;
        if (elements.kpiPembelianLuarSubtext) elements.kpiPembelianLuarSubtext.textContent = `Defisit Pasokan 60 HK (${formatNumber(data.pembelianLuarHarian)} / HK)`;

        // Progress Gauge & Marker Position
        const progressPct = Math.min(100, data.coverageTotalPabrik);
        if (elements.kebunProgressBar) elements.kebunProgressBar.style.width = `${progressPct}%`;

        const markerPosPct = Math.min(100, Math.max(1, data.targetKebunPct));
        if (elements.progressTargetMarker) elements.progressTargetMarker.style.left = `${markerPosPct}%`;
        if (elements.markerLabel) elements.markerLabel.textContent = `Target ${data.targetKebunPct}%`;

        if (elements.lblPercentTercapai) elements.lblPercentTercapai.textContent = `${data.coverageTotalPabrik.toFixed(1)}% tercover dari kebun sendiri (${formatNumber(data.totalProduksiSiklus)} / ${formatNumber(data.kebutuhanPabrikSiklus)} per 3 bulan)`;

        // Target Gap Banner Update
        if (elements.gapAnalysisCard) {
            if (data.gapSiklus <= 0) {
                elements.gapAnalysisCard.className = 'card gap-analysis-card mb-4';
                if (elements.gapStatusTitle) elements.gapStatusTitle.innerHTML = `<i data-lucide="check-circle-2"></i> Target Pasokan Kebun Terpenuhi! 🎉`;
                if (elements.gapStatusDesc) elements.gapStatusDesc.textContent = `Total portofolio (${formatNumber(data.totalLuas)} Ha) menghasilkan ${formatNumber(data.totalProduksiSiklus)} butir per 3 bulan (${formatNumber(data.totalProduksiHarian)} / HK), melampaui target kebun ${data.targetKebunPct}% (${formatNumber(data.targetKebunHarian)} / HK).`;
            } else {
                elements.gapAnalysisCard.className = 'card gap-analysis-card status-warning mb-4';
                if (elements.gapStatusTitle) elements.gapStatusTitle.innerHTML = `<i data-lucide="alert-triangle"></i> Sisa Kekurangan untuk Mencapai Target Kebun (${data.targetKebunPct}%)`;
                if (elements.gapStatusDesc) elements.gapStatusDesc.textContent = `Masih kurang ${formatNumber(data.gapSiklus)} butir per 3 bulan (${formatNumber(data.gapSiklus / 60)} butir/HK). Membutuhkan tambahan lahan sekitar +${formatNumber(data.gapLuasHa)} Ha untuk mencapai 100% target pasokan!`;
            }
        }

        // Table Breakdown Updates
        if (elements.tblProduksiHarian) elements.tblProduksiHarian.textContent = formatNumber(data.totalProduksiHarian);
        if (elements.tblBeliHarian) elements.tblBeliHarian.textContent = formatNumber(data.pembelianLuarHarian);
        if (elements.tblTotalHarian) elements.tblTotalHarian.textContent = formatNumber(data.kebutuhanPabrikHarian);

        if (elements.tblProduksiBulanan) elements.tblProduksiBulanan.textContent = formatNumber(data.totalProduksiBulanan);
        if (elements.tblBeliBulanan) elements.tblBeliBulanan.textContent = formatNumber(data.pembelianLuarBulanan);
        if (elements.tblTotalBulanan) elements.tblTotalBulanan.textContent = formatNumber(data.kebutuhanPabrikBulan);

        if (elements.tblProduksiSiklus) elements.tblProduksiSiklus.textContent = formatNumber(data.totalProduksiSiklus);
        if (elements.tblBeliSiklus) elements.tblBeliSiklus.textContent = formatNumber(data.pembelianLuarSiklus);
        if (elements.tblTotalSiklus) elements.tblTotalSiklus.textContent = formatNumber(data.kebutuhanPabrikSiklus);

        if (elements.tblProduksiTahunan) elements.tblProduksiTahunan.textContent = formatNumber(data.totalProduksiTahunan);
        if (elements.tblBeliTahunan) elements.tblBeliTahunan.textContent = formatNumber(data.pembelianLuarTahunan);
        if (elements.tblTotalTahunan) elements.tblTotalTahunan.textContent = formatNumber(data.kebutuhanPabrikTahunan);

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
        syncDOMToState();
        const data = calculatePortfolioData();
        elements.prevBlockCount.textContent = `${blocksArray.length} Blok Lahan`;
        elements.prevLuas.textContent = `${formatNumber(data.totalLuas)} Ha`;
        elements.prevTotalPohon.textContent = `${formatNumber(data.totalPohon)} Pohon`;
        elements.prevTargetPct.textContent = `${data.targetKebunPct}%`;
        elements.prevHasilPanen.textContent = `${formatNumber(data.totalProduksiSiklus)} Butir`;
        elements.prevHasilHarian.textContent = `${formatNumber(data.totalProduksiHarian)} Butir/HK`;

        // Suggest scenario name based on block names
        const blockNamesSummary = blocksArray.map(b => b.name.replace(/Blok \d+\s*\((.*?)\)/, '$1').replace(/Blok \d+/, '').trim()).filter(Boolean).join(' + ');
        const nameSuffix = blockNamesSummary ? ` [${blockNamesSummary}]` : '';
        elements.scenarioNameInput.value = `Skenario ${blocksArray.length} Blok (${formatNumber(data.totalLuas)} Ha)${nameSuffix} - ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
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
        syncDOMToState();
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
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/api/simulations', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || ''
                },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            if (result.success) {
                showToast(`Skenario "${scenarioName}" berhasil disimpan ke SQLite!`);
                closeModal();
                loadSavedScenarios();
            } else {
                showToast(`Gagal menyimpan: ${result.error || result.message || 'Error validasi'}`, 'danger');
            }
        } catch (err) {
            showToast(`Error menghubungi server API SQLite`, 'danger');
        }
    });

    // Load Saved Scenarios from SQLite API
    async function loadSavedScenarios(autoLoadLatest = false) {
        elements.scenariosTableBody.innerHTML = `<tr><td colspan="11" class="text-center text-muted">Memuat skenario tersimpan...</td></tr>`;
        try {
            const res = await fetch('/api/simulations');
            const result = await res.json();
            if (result.success && result.data.length > 0) {
                renderScenariosTable(result.data);
                if (autoLoadLatest && !window.initialScenarioLoaded) {
                    window.initialScenarioLoaded = true;
                    // Auto-load latest saved scenario so user instantly sees their latest configuration
                    applyScenario(result.data[0].id, false);
                }
            } else {
                elements.scenariosTableBody.innerHTML = `<tr><td colspan="11" class="text-center text-muted">Belum ada skenario yang tersimpan di SQLite.</td></tr>`;
            }
        } catch (err) {
            elements.scenariosTableBody.innerHTML = `<tr><td colspan="11" class="text-center text-amber">Gagal memuat data dari database SQLite.</td></tr>`;
        }
    }

    elements.btnRefreshScenarios.addEventListener('click', () => loadSavedScenarios(false));

    // Render Scenarios Table
    function renderScenariosTable(scenarios) {
        elements.scenariosTableBody.innerHTML = '';
        scenarios.forEach((item, index) => {
            const tr = document.createElement('tr');
            const dateStr = new Date(item.created_at).toLocaleString('id-ID', {
                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            let blocksList = [];
            if (item.blocks_json) {
                if (Array.isArray(item.blocks_json)) {
                    blocksList = item.blocks_json;
                } else if (typeof item.blocks_json === 'string') {
                    try {
                        blocksList = JSON.parse(item.blocks_json);
                    } catch (e) {
                        blocksList = [];
                    }
                }
            }

            const blockCount = Array.isArray(blocksList) && blocksList.length > 0 ? blocksList.length : 1;
            const blockNamesStr = Array.isArray(blocksList) && blocksList.length > 0
                ? blocksList.map(b => b.name || 'Blok').join(', ')
                : '';

            const targetPct = item.target_kebun_pct || 10;
            const totalLuas = item.luas_lahan || 200;
            const hasilSiklus = (item.produksi_harian * 60) || 0;

            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>
                    <strong>${escapeHtml(item.scenario_name)}</strong>
                    ${blockNamesStr ? `<div style="font-size: 0.76rem; color: #94a3b8; margin-top: 3px; display: flex; align-items: center; gap: 4px;"><i data-lucide="layers" style="width:12px;height:12px;color:#10b981;"></i> <span style="color:#cbd5e1;">${escapeHtml(blockNamesStr)}</span></div>` : ''}
                </td>
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
    window.applyScenario = function (id, showNotification = true) {
        const item = (window.savedScenariosCache || []).find(s => s.id == id);
        if (!item) {
            console.error('Scenario not found for id:', id);
            return;
        }

        let parsedBlocks = null;
        if (item.blocks_json) {
            if (Array.isArray(item.blocks_json)) {
                parsedBlocks = item.blocks_json;
            } else if (typeof item.blocks_json === 'string') {
                try {
                    parsedBlocks = JSON.parse(item.blocks_json);
                } catch (e) {
                    console.error('Error parsing blocks_json:', e);
                }
            }
        }

        if (Array.isArray(parsedBlocks) && parsedBlocks.length > 0) {
            blocksArray = parsedBlocks.map((b, idx) => ({
                id: b.id || `block_${Date.now()}_${idx + 1}`,
                name: (b.name && b.name.trim()) ? b.name.trim() : (b.nama && b.nama.trim()) ? b.nama.trim() : `Blok ${idx + 1}`,
                luasLahan: parseFloat(b.luasLahan) || 0,
                pohonPerHa: parseFloat(b.pohonPerHa) || 0,
                usiaPohon: parseFloat(b.usiaPohon) || 10,
                produksiPerPanen: parseFloat(b.produksiPerPanen) || 0,
                persentasePanen: parseFloat(b.persentasePanen) || 100
            }));
        } else {
            blocksArray = [{
                id: 'block_1',
                name: 'Blok 1 (Kebun TMC)',
                luasLahan: parseFloat(item.luas_lahan) || 200,
                pohonPerHa: parseFloat(item.pohon_per_ha) || 50,
                usiaPohon: parseFloat(item.usia_pohon) || 10,
                produksiPerPanen: parseFloat(item.produksi_per_panen) || 20,
                persentasePanen: parseFloat(item.persentase_panen) || 100
            }];
        }

        const targetPct = parseFloat(item.target_kebun_pct) || 10;
        if (elements.targetKebunPctNum) elements.targetKebunPctNum.value = targetPct;
        if (elements.targetKebunPctSlider) {
            elements.targetKebunPctSlider.value = targetPct;
            updateSliderTrack(elements.targetKebunPctSlider);
        }

        if (elements.hariKerjaNum) elements.hariKerjaNum.value = parseInt(item.hari_kerja_bulan) || 20;
        if (elements.kebutuhanPabrikNum) elements.kebutuhanPabrikNum.value = parseFloat(item.kebutuhan_pabrik) || 8000000;

        renderBlocksUI();
        if (showNotification) {
            showToast(`Skenario "${item.scenario_name}" (${blocksArray.length} Blok) berhasil dimuat!`);
            const blocksToolbar = document.querySelector('.blocks-toolbar-header');
            if (blocksToolbar) {
                blocksToolbar.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    // Global action: Delete Scenario from SQLite DB
    window.deleteScenario = async function (id, name) {
        if (!confirm(`Hapus skenario "${name}" dari database SQLite?`)) return;

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch(`/api/simulations/${id}`, { 
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || ''
                }
            });
            const result = await res.json();
            if (result.success) {
                showToast(`Skenario "${name}" berhasil dihapus.`);
                loadSavedScenarios();
            } else {
                showToast(`Gagal menghapus: ${result.error || result.message}`, 'danger');
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
    loadSavedScenarios(true);
});
