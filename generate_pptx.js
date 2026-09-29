import pptxgen from 'pptxgenjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createPresentation() {
    const pptx = new pptxgen();

    // Presentation Settings
    pptx.layout = 'LAYOUT_16x9';
    pptx.title = 'PAPARAN ESTIMASI STRATEGIS PORTOFOLIO KEBUN TMC';
    pptx.subject = 'Rencana Pencapaian Target Pasokan Mandiri 10% Pabrik Kelapa Terpadu';
    pptx.author = 'PT Tri Mustika Cemerlang (TMC)';
    pptx.company = 'TMC Estate Division';

    // Theme Colors
    const COLORS = {
        primary: '047857',      // Emerald Green
        primaryDark: '064e3b',  // Deep Forest Green
        primaryLight: 'ecfdf5', // Soft Mint
        navy: '0f172a',         // Dark Slate
        slate: '334155',        // Medium Slate
        grayMuted: '64748b',    // Light Slate
        bgLight: 'f8fafc',      // Card Light Background
        border: 'cbd5e1',       // Border Gray
        white: 'ffffff',
        accentBlue: '0284c7',   // Binjeita Blue
        accentPurple: '7c3aed', // Expansion Purple
        accentAmber: 'd97706'   // External Purchase Amber
    };

    // Helper: Add Standard Header
    function addHeader(slide, title, category = 'PORTOFOLIO KEBUN TMC') {
        // Category Subtitle
        slide.addText(category.toUpperCase(), {
            x: 0.8,
            y: 0.45,
            w: 11.5,
            h: 0.3,
            fontSize: 9,
            bold: true,
            color: COLORS.primary,
            fontFace: 'Arial'
        });

        // Main Slide Title
        slide.addText(title, {
            x: 0.8,
            y: 0.72,
            w: 11.5,
            h: 0.55,
            fontSize: 18,
            bold: true,
            color: COLORS.navy,
            fontFace: 'Arial'
        });

        // Divider Line
        slide.addShape(pptx.ShapeType.line, {
            x: 0.8,
            y: 1.3,
            w: 11.7,
            h: 0,
            line: { color: COLORS.border, width: 1 }
        });
    }

    // Helper: Add Standard Footer
    function addFooter(slide, pageNum, totalPages = 6) {
        slide.addText('PT Tri Mustika Cemerlang (TMC) • Divisi Estimasi & Pengembangan Kebun', {
            x: 0.8,
            y: 7.0,
            w: 8.5,
            h: 0.3,
            fontSize: 8,
            color: COLORS.grayMuted,
            fontFace: 'Arial'
        });

        slide.addText(`Slide ${pageNum} of ${totalPages}`, {
            x: 9.5,
            y: 7.0,
            w: 3.0,
            h: 0.3,
            fontSize: 8,
            align: 'right',
            color: COLORS.grayMuted,
            fontFace: 'Arial'
        });
    }

    // ==========================================
    // SLIDE 1: COVER / TITLE SLIDE
    // ==========================================
    {
        const slide = pptx.addSlide();
        
        // Background Dark Emerald
        slide.background = { color: COLORS.primaryDark };

        // Accent Decorative Pill
        slide.addShape(pptx.ShapeType.roundRect, {
            x: 1.0,
            y: 1.6,
            w: 3.2,
            h: 0.38,
            rectRadius: 0.15,
            fill: { color: '065f46' },
            line: { color: '10b981', width: 1 }
        });
        slide.addText('ESTIMASI PORTOFOLIO LAHAN', {
            x: 1.0,
            y: 1.6,
            w: 3.2,
            h: 0.38,
            fontSize: 9,
            bold: true,
            color: '6ee7b7',
            align: 'center',
            valign: 'middle',
            fontFace: 'Arial'
        });

        // Main Title
        slide.addText('PAPARAN ESTIMASI STRATEGIS\nPORTOFOLIO KEBUN TMC', {
            x: 1.0,
            y: 2.2,
            w: 11.3,
            h: 1.5,
            fontSize: 28,
            bold: true,
            color: COLORS.white,
            fontFace: 'Arial',
            lineSpacing: 34
        });

        // Subtitle
        slide.addText('Rencana Pencapaian Target Pasokan Mandiri 10% Pabrik Kelapa Terpadu', {
            x: 1.0,
            y: 3.8,
            w: 11.3,
            h: 0.5,
            fontSize: 14,
            color: 'a7f3d0',
            fontFace: 'Arial'
        });

        // Horizontal Line
        slide.addShape(pptx.ShapeType.line, {
            x: 1.0,
            y: 4.5,
            w: 11.3,
            h: 0,
            line: { color: '047857', width: 1.5 }
        });

        // Scenario Card Metadata
        slide.addShape(pptx.ShapeType.roundRect, {
            x: 1.0,
            y: 4.85,
            w: 11.3,
            h: 1.35,
            rectRadius: 0.1,
            fill: { color: '022c22' },
            line: { color: '047857', width: 1 }
        });

        const metaText = [
            { text: 'BASIS DATA SKENARIO TERVERIFIKASI:\n', options: { fontSize: 9, bold: true, color: '34d399' } },
            { text: '• Skenario 3 Blok (2.379 Ha) [Kebun TMC + Binjeita + Lahan Ekspansi] - 23.47\n', options: { fontSize: 11, bold: true, color: COLORS.white } },
            { text: '• Total Lahan: 2.379 Ha  |  Total Populasi: 120.030 Pohon  |  Output: 2.400.600 Butir / 3 Bulan (40.010 Butir/HK)', options: { fontSize: 9.5, color: '99f6e4' } }
        ];
        slide.addText(metaText, {
            x: 1.25,
            y: 5.0,
            w: 10.8,
            h: 1.05,
            fontFace: 'Arial'
        });

        slide.addText('PT TRI MUSTIKA CEMERLANG • DIVISI ESTIMASI & PENGEMBANGAN LAHAN', {
            x: 1.0,
            y: 6.8,
            w: 11.3,
            h: 0.3,
            fontSize: 8.5,
            color: '6ee7b7',
            fontFace: 'Arial'
        });
    }

    // ==========================================
    // SLIDE 2: LATAR BELAKANG & TARGET MANDIRI 10%
    // ==========================================
    {
        const slide = pptx.addSlide();
        addHeader(slide, '1. Kebutuhan Pasokan Kelapa TMC: Target Supply Kebun Mandiri 10% / Hari');

        // Top Narrative Card
        slide.addShape(pptx.ShapeType.roundRect, {
            x: 0.8,
            y: 1.45,
            w: 11.7,
            h: 1.65,
            rectRadius: 0.08,
            fill: { color: COLORS.bgLight },
            line: { color: COLORS.border, width: 1 }
        });

        const narrativeText = [
            { text: '• Target Kebutuhan Produksi Pabrik: ', options: { fontSize: 9.5, bold: true, color: COLORS.primary } },
            { text: 'Kebutuhan bahan baku produksi pabrik pengolahan kelapa terpadu TMC ditetapkan sebesar ', options: { fontSize: 8.5, color: COLORS.slate } },
            { text: '400.000 butir kelapa/hari kerja ', options: { fontSize: 8.5, bold: true, color: COLORS.navy } },
            { text: '(20 HK/bulan = 8.000.000 butir/bulan atau 24.000.000 butir per kuartal 3 bulan) yang harus dipenuhi secara stabil dan berkesinambungan.\n', options: { fontSize: 8.5, color: COLORS.slate } },
            { text: '• Kebutuhan Perusahaan: Supply dari Perkebunan TMC (10% Target Harian): ', options: { fontSize: 9.5, bold: true, color: COLORS.primary } },
            { text: 'Perusahaan menetapkan pemenuhan pasokan dari kebun internal sebesar ', options: { fontSize: 8.5, color: COLORS.slate } },
            { text: '10% per hari (40.000 butir/hari kerja atau 2.400.000 butir per kuartal 3 bulan) ', options: { fontSize: 8.5, bold: true, color: COLORS.primary } },
            { text: 'guna menjaga stabilitas HPP serta menjamin buffer stock operasional pabrik.\n', options: { fontSize: 8.5, color: COLORS.slate } },
            { text: '• Realisasi Saat Ini - Perkebunan TMC Eksisting (Blok 1): ', options: { fontSize: 9.5, bold: true, color: COLORS.primary } },
            { text: 'Sesuai hasil panen saat ini di seluruh kebun produktif TMC (Blok 1 seluas 200 Ha), produksi per kuartal (3 bulan) telah mencapai ', options: { fontSize: 8.5, color: COLORS.slate } },
            { text: 'hampir 200.000 butir kelapa (3.333 butir/HK). ', options: { fontSize: 8.5, bold: true, color: COLORS.navy } },
            { text: 'Hasil ini telah menutup 8,33% kebutuhan supply kebun internal (0,83% kebutuhan produksi pabrik), sehingga sisa kebutuhan sebesar 2.200.000 butir/kuartal diselesaikan melalui ekspansi lahan baru.', options: { fontSize: 8.5, color: COLORS.slate } }
        ];
        slide.addText(narrativeText, {
            x: 1.1,
            y: 1.52,
            w: 11.1,
            h: 1.5,
            fontFace: 'Arial'
        });

        // 4 KPI Summary Cards
        const kpiCards = [
            { label: 'TARGET PRODUKSI PABRIK', val: '400.000', sub: 'Butir/Hari (24 Juta/3 Bln)', color: COLORS.navy, bg: COLORS.bgLight, border: COLORS.border },
            { label: 'TARGET SUPPLY KEBUN (10%)', val: '40.000', sub: 'Butir/Hari (2,4 Juta/3 Bln)', color: COLORS.primary, bg: 'ecfdf5', border: 'a7f3d0' },
            { label: 'HASIL SAAT INI (BLOK 1)', val: '~200.000', sub: 'Butir/3 Bln (3.333 Btr/HK)', color: COLORS.navy, bg: COLORS.bgLight, border: COLORS.border },
            { label: 'PORTOFOLIO 3 BLOK KEBUN', val: '2.400.600', sub: '40.010 Butir/HK (100,03%)', color: COLORS.primary, bg: 'ecfdf5', border: 'a7f3d0' }
        ];

        kpiCards.forEach((kpi, idx) => {
            const cardX = 0.8 + idx * (2.75 + 0.23);
            slide.addShape(pptx.ShapeType.roundRect, {
                x: cardX,
                y: 3.3,
                w: 2.75,
                h: 1.55,
                rectRadius: 0.08,
                fill: { color: kpi.bg },
                line: { color: kpi.border, width: 1.5 }
            });

            slide.addText(kpi.label, {
                x: cardX + 0.15,
                y: 3.45,
                w: 2.45,
                h: 0.32,
                fontSize: 8,
                bold: true,
                color: COLORS.grayMuted,
                align: 'center',
                fontFace: 'Arial'
            });

            slide.addText(kpi.val, {
                x: cardX + 0.15,
                y: 3.82,
                w: 2.45,
                h: 0.52,
                fontSize: 15,
                bold: true,
                color: kpi.color,
                align: 'center',
                fontFace: 'Arial'
            });

            slide.addText(kpi.sub, {
                x: cardX + 0.15,
                y: 4.38,
                w: 2.45,
                h: 0.3,
                fontSize: 7.5,
                color: COLORS.slate,
                align: 'center',
                fontFace: 'Arial'
            });
        });

        // Bottom Highlight Banner
        slide.addShape(pptx.ShapeType.roundRect, {
            x: 0.8,
            y: 5.15,
            w: 11.7,
            h: 1.45,
            rectRadius: 0.08,
            fill: { color: 'f0fdf4' },
            line: { color: '86efac', width: 1.5 }
        });

        const bannerText = [
            { text: 'Kesimpulan Analisis Pasokan:\n', options: { fontSize: 10.5, bold: true, color: '166534' } },
            { text: 'Realisasi panen kebun eksisting (Blok 1) yang mencapai hampir 200.000 butir per kuartal membuktikan kelayakan produktivitas kebun TMC. ', options: { fontSize: 9.5, color: COLORS.slate } },
            { text: 'Guna memenuhi target supply harian 10% (40.000 butir/HK), akuisisi Blok 2 (Binjeita 135 Ha) dan pengalokasian Blok 3 (Ekspansi 2.044 Ha) secara definitif menuntaskan sisa defisit 2.200.000 butir kelapa.', options: { fontSize: 9.5, bold: true, color: '166534' } }
        ];
        slide.addText(bannerText, {
            x: 1.1,
            y: 5.3,
            w: 11.1,
            h: 1.15,
            fontFace: 'Arial'
        });

        addFooter(slide, 2);
    }

    // ==========================================
    // SLIDE 3: ANALISIS BERTAHAP PORTOFOLIO LAHAN
    // ==========================================
    {
        const slide = pptx.addSlide();
        addHeader(slide, '2. Analisis Bertahap Portofolio Lahan Menuju Target 10%');

        const blockCols = [
            {
                tag: 'TAHAP 1: EKSISTING',
                tagBg: 'dcfce7',
                tagColor: '15803d',
                title: 'Blok 1 (Kebun TMC)',
                borderColor: COLORS.primary,
                bg: COLORS.white,
                items: [
                    ['Status Lahan', 'Eksisting (Milik Sendiri)'],
                    ['Luas Lahan', '200 Ha'],
                    ['Kerapatan', '50 Pohon / Ha'],
                    ['Populasi Pohon', '10.000 Pohon'],
                    ['Usia Rata-rata', '15 Thn (Puncak 100%)'],
                    ['Yield Panen', '20 Butir / Pohon'],
                    ['Hasil / 3 Bulan', '200.000 Butir'],
                    ['Pasokan Harian', '3.333 Butir / HK'],
                    ['Porsi Target 10%', '8,33% (Baru 0,83% Pabrik)']
                ]
            },
            {
                tag: 'TAHAP 2: DEAL BARU',
                tagBg: 'e0f2fe',
                tagColor: '0369a1',
                title: 'Blok 2 (Binjeita)',
                borderColor: COLORS.accentBlue,
                bg: COLORS.white,
                items: [
                    ['Status Lahan', 'Deal Akuisisi (135 Ha)'],
                    ['Luas Lahan', '135 Ha'],
                    ['Kerapatan', '58 Pohon / Ha'],
                    ['Populasi Pohon', '7.830 Pohon'],
                    ['Usia Rata-rata', '15 Thn (Puncak 100%)'],
                    ['Yield Panen', '20 Butir / Pohon'],
                    ['Hasil / 3 Bulan', '156.600 Butir'],
                    ['Pasokan Harian', '2.610 Butir / HK'],
                    ['Porsi Target 10%', '6,53% (Baru 0,65% Pabrik)']
                ]
            },
            {
                tag: 'TAHAP 3: EKSPANSI KEBUN',
                tagBg: 'f3e8ff',
                tagColor: '6b21a8',
                title: 'Blok 3 (Lahan Ekspansi)',
                borderColor: COLORS.accentPurple,
                bg: 'faf5ff',
                items: [
                    ['Status Lahan', 'Kebutuhan Lahan Baru'],
                    ['Luas Lahan', '2.044 Ha'],
                    ['Kerapatan', '50 Pohon / Ha'],
                    ['Populasi Pohon', '102.200 Pohon'],
                    ['Usia Rata-rata', '15 Thn (Puncak 100%)'],
                    ['Yield Panen', '20 Butir / Pohon'],
                    ['Hasil / 3 Bulan', '2.044.000 Butir'],
                    ['Pasokan Harian', '34.067 Butir / HK'],
                    ['Porsi Target 10%', '85,17% (Penutup Defisit)']
                ]
            }
        ];

        blockCols.forEach((col, idx) => {
            const colX = 0.8 + idx * (3.73 + 0.25);
            
            // Box Container
            slide.addShape(pptx.ShapeType.roundRect, {
                x: colX,
                y: 1.5,
                w: 3.73,
                h: 3.9,
                rectRadius: 0.08,
                fill: { color: col.bg },
                line: { color: col.borderColor, width: 2 }
            });

            // Badge
            slide.addShape(pptx.ShapeType.roundRect, {
                x: colX + 0.2,
                y: 1.68,
                w: 2.3,
                h: 0.28,
                rectRadius: 0.06,
                fill: { color: col.tagBg },
                line: { color: col.tagBg, width: 0 }
            });
            slide.addText(col.tag, {
                x: colX + 0.2,
                y: 1.68,
                w: 2.3,
                h: 0.28,
                fontSize: 8,
                bold: true,
                color: col.tagColor,
                align: 'center',
                valign: 'middle',
                fontFace: 'Arial'
            });

            // Block Title
            slide.addText(col.title, {
                x: colX + 0.2,
                y: 2.05,
                w: 3.33,
                h: 0.4,
                fontSize: 12,
                bold: true,
                color: COLORS.navy,
                fontFace: 'Arial'
            });

            // Block Items
            col.items.forEach((it, itIdx) => {
                const itemY = 2.45 + itIdx * 0.31;
                slide.addText(it[0], {
                    x: colX + 0.2,
                    y: itemY,
                    w: 1.6,
                    h: 0.28,
                    fontSize: 8,
                    color: COLORS.grayMuted,
                    fontFace: 'Arial'
                });
                slide.addText(it[1], {
                    x: colX + 1.8,
                    y: itemY,
                    w: 1.73,
                    h: 0.28,
                    fontSize: 8,
                    bold: true,
                    align: 'right',
                    color: COLORS.navy,
                    fontFace: 'Arial'
                });
            });
        });

        // Bottom GAP Banner
        slide.addShape(pptx.ShapeType.roundRect, {
            x: 0.8,
            y: 5.58,
            w: 11.7,
            h: 1.25,
            rectRadius: 0.08,
            fill: { color: 'fef2f2' },
            line: { color: 'fca5a5', width: 1.5 }
        });

        const gapText = [
            { text: 'ANALISIS GAP PASOKAN (KUNCI KEPUTUSAN EKSEKUTIF):\n', options: { fontSize: 10, bold: true, color: 'b91c1c' } },
            { text: '• Akumulasi Blok 1 + Blok 2 (335 Ha) baru menghasilkan ', options: { fontSize: 9, color: COLORS.slate } },
            { text: '356.600 butir / 3 bulan (14,86% dari target 10%).\n', options: { fontSize: 9, bold: true, color: COLORS.navy } },
            { text: '• Masih terdapat DEFISIT sebesar ', options: { fontSize: 9, color: COLORS.slate } },
            { text: '2.043.400 butir per 3 bulan (34.057 butir/HK). ', options: { fontSize: 9, bold: true, color: 'b91c1c' } },
            { text: 'Oleh karena itu, penyediaan Blok 3 seluas 2.044 Ha adalah mutlak agar defisit tertutup 100%.', options: { fontSize: 9, color: COLORS.slate } }
        ];
        slide.addText(gapText, {
            x: 1.1,
            y: 5.68,
            w: 11.1,
            h: 1.05,
            fontFace: 'Arial'
        });

        addFooter(slide, 3);
    }

    // ==========================================
    // SLIDE 4: MATRIKS KOMPARASI PORTOFOLIO LENGKAP
    // ==========================================
    {
        const slide = pptx.addSlide();
        addHeader(slide, '3. Matriks Komparasi Portofolio Kumulatif (2.379 Ha)');

        // Structured Table
        const tableData = [
            [
                { text: 'Indikator Parameter', options: { bold: true, fill: 'f1f5f9', color: COLORS.navy, align: 'left' } },
                { text: 'Blok 1 (Kebun TMC)', options: { bold: true, fill: 'f1f5f9', color: COLORS.navy, align: 'center' } },
                { text: 'Blok 2 (Binjeita)', options: { bold: true, fill: 'f1f5f9', color: COLORS.navy, align: 'center' } },
                { text: 'Blok 3 (Lahan Ekspansi)', options: { bold: true, fill: 'f1f5f9', color: COLORS.navy, align: 'center' } },
                { text: 'TOTAL PORTOFOLIO', options: { bold: true, fill: 'd1fae5', color: COLORS.primaryDark, align: 'center' } }
            ],
            [
                { text: 'Status Lahan', options: { bold: true, align: 'left' } },
                { text: 'Eksisting', options: { align: 'center' } },
                { text: 'Deal 135 Ha', options: { align: 'center' } },
                { text: 'Lahan Baru Diperlukan', options: { align: 'center' } },
                { text: '100% Target Terpenuhi', options: { bold: true, color: COLORS.primary, align: 'center', fill: 'ecfdf5' } }
            ],
            [
                { text: 'Luas Lahan (Ha)', options: { bold: true, align: 'left' } },
                { text: '200 Ha', options: { align: 'right' } },
                { text: '135 Ha', options: { align: 'right' } },
                { text: '2.044 Ha', options: { align: 'right' } },
                { text: '2.379 Ha', options: { bold: true, align: 'right', fill: 'ecfdf5' } }
            ],
            [
                { text: 'Kerapatan Pohon / Ha', options: { bold: true, align: 'left' } },
                { text: '50 Pohon', options: { align: 'right' } },
                { text: '58 Pohon', options: { align: 'right' } },
                { text: '50 Pohon', options: { align: 'right' } },
                { text: '50,5 Pohon (Rata-rata)', options: { bold: true, align: 'right', fill: 'ecfdf5' } }
            ],
            [
                { text: 'Populasi Pohon', options: { bold: true, align: 'left' } },
                { text: '10.000', options: { align: 'right' } },
                { text: '7.830', options: { align: 'right' } },
                { text: '102.200', options: { align: 'right' } },
                { text: '120.030 Pohon', options: { bold: true, align: 'right', fill: 'ecfdf5' } }
            ],
            [
                { text: 'Usia Rata-rata Pohon', options: { bold: true, align: 'left' } },
                { text: '15 Thn (Puncak 100%)', options: { align: 'right' } },
                { text: '15 Thn (Puncak 100%)', options: { align: 'right' } },
                { text: '15 Thn (Puncak 100%)', options: { align: 'right' } },
                { text: '15 Thn (Puncak 100%)', options: { bold: true, align: 'right', fill: 'ecfdf5' } }
            ],
            [
                { text: 'Yield / Pohon / Panen (3 Bln)', options: { bold: true, align: 'left' } },
                { text: '20 Butir', options: { align: 'right' } },
                { text: '20 Butir', options: { align: 'right' } },
                { text: '20 Butir', options: { align: 'right' } },
                { text: '20 Butir', options: { bold: true, align: 'right', fill: 'ecfdf5' } }
            ],
            [
                { text: 'Hasil / Siklus (3 Bulan)', options: { bold: true, align: 'left' } },
                { text: '200.000 Butir', options: { align: 'right' } },
                { text: '156.600 Butir', options: { align: 'right' } },
                { text: '2.044.000 Butir', options: { align: 'right' } },
                { text: '2.400.600 Butir', options: { bold: true, color: COLORS.primaryDark, align: 'right', fill: 'd1fae5' } }
            ],
            [
                { text: 'Pasokan Harian (60 HK)', options: { bold: true, align: 'left' } },
                { text: '3.333 Btr/HK', options: { align: 'right' } },
                { text: '2.610 Btr/HK', options: { align: 'right' } },
                { text: '34.067 Btr/HK', options: { align: 'right' } },
                { text: '40.010 Btr/HK', options: { bold: true, color: COLORS.primaryDark, align: 'right', fill: 'd1fae5' } }
            ],
            [
                { text: 'Porsi Pemenuhan Target 10%', options: { bold: true, align: 'left' } },
                { text: '8,33%', options: { align: 'right' } },
                { text: '6,53%', options: { align: 'right' } },
                { text: '85,17%', options: { align: 'right' } },
                { text: '100,03% (TUNTAS)', options: { bold: true, color: COLORS.primaryDark, align: 'right', fill: 'd1fae5' } }
            ],
            [
                { text: 'Coverage terhadap Total Pabrik', options: { bold: true, align: 'left' } },
                { text: '0,83%', options: { align: 'right' } },
                { text: '0,65%', options: { align: 'right' } },
                { text: '8,52%', options: { align: 'right' } },
                { text: '10,00% (Sesuai Target)', options: { bold: true, color: COLORS.primaryDark, align: 'right', fill: 'd1fae5' } }
            ]
        ];

        slide.addTable(tableData, {
            x: 0.8,
            y: 1.55,
            w: 11.7,
            colW: [2.9, 2.1, 2.1, 2.4, 2.2],
            fontSize: 8.5,
            rowH: 0.44,
            border: { color: COLORS.border, width: 0.5 },
            fontFace: 'Arial'
        });

        addFooter(slide, 4);
    }

    // ==========================================
    // SLIDE 5: ALOKASI PASOKAN PABRIK AKHIR
    // ==========================================
    {
        const slide = pptx.addSlide();
        addHeader(slide, '4. Neraca Alokasi Pasokan Pabrik (Siklus & Tahunan)');

        // Left Container: Siklus 3 Bulan
        slide.addShape(pptx.ShapeType.roundRect, {
            x: 0.8,
            y: 1.5,
            w: 5.7,
            h: 3.5,
            rectRadius: 0.08,
            fill: { color: COLORS.bgLight },
            line: { color: COLORS.border, width: 1 }
        });

        slide.addText('ALOKASI PASOKAN / 3 BULAN (SIKLUS PANEN)', {
            x: 1.0,
            y: 1.68,
            w: 5.3,
            h: 0.35,
            fontSize: 10,
            bold: true,
            color: COLORS.navy,
            fontFace: 'Arial'
        });

        // Bar Mandiri
        slide.addShape(pptx.ShapeType.roundRect, {
            x: 1.0,
            y: 2.15,
            w: 5.3,
            h: 1.15,
            rectRadius: 0.06,
            fill: { color: 'ecfdf5' },
            line: { color: 'a7f3d0', width: 1 }
        });
        slide.addText('KEBUN MANDIRI TMC (3 BLOK): 10,00%', {
            x: 1.15,
            y: 2.25,
            w: 5.0,
            h: 0.3,
            fontSize: 9,
            bold: true,
            color: COLORS.primaryDark,
            fontFace: 'Arial'
        });
        slide.addText('2.400.600 Butir / 3 Bulan (40.010 Butir / HK)', {
            x: 1.15,
            y: 2.58,
            w: 5.0,
            h: 0.55,
            fontSize: 13,
            bold: true,
            color: COLORS.primary,
            fontFace: 'Arial'
        });

        // Bar Luar
        slide.addShape(pptx.ShapeType.roundRect, {
            x: 1.0,
            y: 3.45,
            w: 5.3,
            h: 1.15,
            rectRadius: 0.06,
            fill: { color: 'fffbeb' },
            line: { color: 'fde68a', width: 1 }
        });
        slide.addText('PEMBELIAN DARI PETANI LUAR: 90,00%', {
            x: 1.15,
            y: 3.55,
            w: 5.0,
            h: 0.3,
            fontSize: 9,
            bold: true,
            color: '92400e',
            fontFace: 'Arial'
        });
        slide.addText('21.599.400 Butir / 3 Bulan (359.990 Butir / HK)', {
            x: 1.15,
            y: 3.88,
            w: 5.0,
            h: 0.55,
            fontSize: 13,
            bold: true,
            color: COLORS.accentAmber,
            fontFace: 'Arial'
        });

        // Right Container: Tahunan
        slide.addShape(pptx.ShapeType.roundRect, {
            x: 6.8,
            y: 1.5,
            w: 5.7,
            h: 3.5,
            rectRadius: 0.08,
            fill: { color: COLORS.bgLight },
            line: { color: COLORS.border, width: 1 }
        });

        slide.addText('ALOKASI PASOKAN TAHUNAN (4x SIKLUS PANEN)', {
            x: 7.0,
            y: 1.68,
            w: 5.3,
            h: 0.35,
            fontSize: 10,
            bold: true,
            color: COLORS.navy,
            fontFace: 'Arial'
        });

        // Bar Mandiri Tahunan
        slide.addShape(pptx.ShapeType.roundRect, {
            x: 7.0,
            y: 2.15,
            w: 5.3,
            h: 1.15,
            rectRadius: 0.06,
            fill: { color: 'ecfdf5' },
            line: { color: 'a7f3d0', width: 1 }
        });
        slide.addText('TOTAL MANDIRI TAHUNAN: 10,00%', {
            x: 7.15,
            y: 2.25,
            w: 5.0,
            h: 0.3,
            fontSize: 9,
            bold: true,
            color: COLORS.primaryDark,
            fontFace: 'Arial'
        });
        slide.addText('9.602.400 Butir / Tahun (Buffer Pasokan)', {
            x: 7.15,
            y: 2.58,
            w: 5.0,
            h: 0.55,
            fontSize: 13,
            bold: true,
            color: COLORS.primary,
            fontFace: 'Arial'
        });

        // Bar Luar Tahunan
        slide.addShape(pptx.ShapeType.roundRect, {
            x: 7.0,
            y: 3.45,
            w: 5.3,
            h: 1.15,
            rectRadius: 0.06,
            fill: { color: 'fffbeb' },
            line: { color: 'fde68a', width: 1 }
        });
        slide.addText('TOTAL BELI LUAR TAHUNAN: 90,00%', {
            x: 7.15,
            y: 3.55,
            w: 5.0,
            h: 0.3,
            fontSize: 9,
            bold: true,
            color: '92400e',
            fontFace: 'Arial'
        });
        slide.addText('86.397.600 Butir / Tahun (Mitra Petani)', {
            x: 7.15,
            y: 3.88,
            w: 5.0,
            h: 0.55,
            fontSize: 13,
            bold: true,
            color: COLORS.accentAmber,
            fontFace: 'Arial'
        });

        // Bottom Value Pillars (3 Boxes)
        const pillars = [
            { title: '1. KONTROL MUTU & GRADING', desc: 'Bahan baku dari kebun sendiri terjamin umur petik optimal dan ukuran butir seragam.' },
            { title: '2. MITIGASI FLUKTUASI HARGA', desc: 'Menurunkan sensitivitas biaya produksi saat lonjakan harga kelapa di pasar bebas.' },
            { title: '3. BUFFER KELANGKAAN PASOKAN', desc: 'Pabrik tetap dapat beroperasi secara kontinyu saat terjadi kendala panen di petani mitra.' }
        ];

        pillars.forEach((p, idx) => {
            const px = 0.8 + idx * (3.73 + 0.25);
            slide.addShape(pptx.ShapeType.roundRect, {
                x: px,
                y: 5.2,
                w: 3.73,
                h: 1.65,
                rectRadius: 0.08,
                fill: { color: COLORS.white },
                line: { color: COLORS.border, width: 1 }
            });

            slide.addText(p.title, {
                x: px + 0.15,
                y: 5.35,
                w: 3.43,
                h: 0.35,
                fontSize: 9,
                bold: true,
                color: COLORS.primaryDark,
                fontFace: 'Arial'
            });

            slide.addText(p.desc, {
                x: px + 0.15,
                y: 5.75,
                w: 3.43,
                h: 0.95,
                fontSize: 8.5,
                color: COLORS.slate,
                fontFace: 'Arial'
            });
        });

        addFooter(slide, 5);
    }

    // ==========================================
    // SLIDE 6: KESIMPULAN & REKOMENDASI KEPUTUSAN
    // ==========================================
    {
        const slide = pptx.addSlide();
        addHeader(slide, '5. Kesimpulan Portofolio & Rekomendasi Investasi');

        // Main Recommendation Cards (3 Cards)
        const recs = [
            {
                num: '01',
                title: 'Finalisasi Akuisisi Blok 2 (Binjeita 135 Ha)',
                desc: 'Mempercepat penyelesaian proses kesepakatan (deal) lahan Binjeita seluas 135 Ha dengan estimasi kontribusi 156.600 butir/3 bulan (2.610 butir/HK). Langkah ini menaikkan rasio pasokan mandiri menjadi 14,86% dari target kebun.',
                accent: COLORS.accentBlue
            },
            {
                num: '02',
                title: 'Alokasi Capex Lahan Ekspansi Blok 3 (2.044 Ha)',
                desc: 'Mengesahkan penganggaran modal (CAPEX) untuk akuisisi/pembukaan lahan ekspansi Blok 3 seluas 2.044 Ha. Blok 3 adalah penentu utama yang menyumbang 85,17% dari target kebutuhan supply 10% kebun TMC (2.044.000 butir/3 bulan).',
                accent: COLORS.primary
            },
            {
                num: '03',
                title: 'Standarisasi Agronomi & Infrastruktur Logistik',
                desc: 'Menerapkan protokol budidaya kelapa produktif terpadu dengan target kerapatan rata-rata 50,5 pohon/Ha dan produktivitas minimal 20 butir/pohon/panen, didukung konektivitas armada angkut langsung menuju pabrik TMC.',
                accent: COLORS.accentPurple
            }
        ];

        recs.forEach((rec, idx) => {
            const ry = 1.55 + idx * 1.5;
            slide.addShape(pptx.ShapeType.roundRect, {
                x: 0.8,
                y: ry,
                w: 11.7,
                h: 1.35,
                rectRadius: 0.08,
                fill: { color: COLORS.white },
                line: { color: COLORS.border, width: 1 }
            });

            // Accent Left Bar
            slide.addShape(pptx.ShapeType.roundRect, {
                x: 0.8,
                y: ry,
                w: 0.15,
                h: 1.35,
                rectRadius: 0.05,
                fill: { color: rec.accent },
                line: { color: rec.accent, width: 0 }
            });

            // Number Badge
            slide.addText(rec.num, {
                x: 1.1,
                y: ry + 0.18,
                w: 0.6,
                h: 0.5,
                fontSize: 18,
                bold: true,
                color: rec.accent,
                fontFace: 'Arial'
            });

            // Title
            slide.addText(rec.title, {
                x: 1.75,
                y: ry + 0.18,
                w: 10.5,
                h: 0.35,
                fontSize: 11,
                bold: true,
                color: COLORS.navy,
                fontFace: 'Arial'
            });

            // Description
            slide.addText(rec.desc, {
                x: 1.75,
                y: ry + 0.55,
                w: 10.5,
                h: 0.7,
                fontSize: 8.5,
                color: COLORS.slate,
                fontFace: 'Arial'
            });
        });

        // Bottom Executive Stamp
        slide.addShape(pptx.ShapeType.roundRect, {
            x: 0.8,
            y: 6.15,
            w: 11.7,
            h: 0.65,
            rectRadius: 0.06,
            fill: { color: 'ecfdf5' },
            line: { color: '10b981', width: 1 }
        });

        slide.addText('RINGKASAN EKSEKUTIF: Portofolio 3 Blok seluas 2.379 Ha (120.030 pohon) menghasilkan 2.400.600 butir/3 bulan, TUNTAS memenuhi 100% kebutuhan supply perkebunan TMC (10% target harian produksi pabrik 400.000 butir kelapa/hari).', {
            x: 1.0,
            y: 6.18,
            w: 11.3,
            h: 0.58,
            fontSize: 8.5,
            bold: true,
            color: COLORS.primaryDark,
            align: 'center',
            valign: 'middle',
            fontFace: 'Arial'
        });

        addFooter(slide, 6);
    }

    // Save File
    const outputPath = path.join(__dirname, 'PAPARAN_ESTIMASI_STRATEGIS_PORTOFOLIO_KEBUN_TMC.pptx');
    await pptx.writeFile({ fileName: outputPath });
    console.log(`Presentation created successfully: ${outputPath}`);
}

createPresentation().catch(err => {
    console.error('Error generating presentation:', err);
    process.exit(1);
});
