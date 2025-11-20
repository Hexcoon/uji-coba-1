// dashboard.js

// Tambahkan definisi URL Bapanas (untuk link berita)
const BAPANAS_NEWS_URL = 'https://panelharga.badanpangan.go.id/berita'; 

$(document).ready(function() {
    // Inisialisasi Chart
    let predictionChart, historicalChart;
    
    // --- INISIALISASI TANGGAL KALENDER ---
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(today.getDate() - 60);

    const todayISO = today.toISOString().split('T')[0];
    const thirtyDaysAgoISO = thirtyDaysAgo.toISOString().split('T')[0];
    const sixtyDaysAgoISO = sixtyDaysAgo.toISOString().split('T')[0];
    
    // Set nilai default di input tanggal
    $('#historicalStartDate').val(sixtyDaysAgoISO);
    $('#historicalEndDate').val(thirtyDaysAgoISO); // Data historis 30 hari berakhir 30 hari yang lalu
    $('#predictionStartDate').val(todayISO); // Prediksi dimulai hari ini

    // Load data awal
    loadCommodityData('beras');
    
    // Muat Berita dari Bapanas (Mockup/Simulasi)
    loadBapanasNews(); // Panggil fungsi baru

    // Handle perubahan pilihan komoditas DAN TANGGAL
    $('#commoditySelect, #historicalStartDate, #historicalEndDate').on('change', function() {
        const selectedCommodity = $('#commoditySelect').val();
        loadCommodityData(selectedCommodity);
        
        // Efek notifikasi kecil saat ganti data
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true
        });
        Toast.fire({
            icon: 'info',
            title: 'Memuat data ' + selectedCommodity
        });
    });
    
    // ... (FUNGSI MATEMATIKA: REGRESI LINEAR & generateRandomData TETAP SAMA) ...
    // ... (INTEGRASI DATA LOCALSTORAGE TETAP SAMA) ...
    
    // --- FUNGSI UTAMA LOAD DATA ---
    function loadCommodityData(commodity) {
        const data = getCommodityData(commodity);
        updateFactorInfo(data.factors);
        
        // Prediksi AI (30 hari setelah tanggal mulai prediksi yang dipilih)
        updatePredictionChart(data.prediction, $('#predictionStartDate').val());
        
        // Data Historis (antara tanggal start dan end historis)
        updateHistoricalChart(data.historical, commodity, $('#historicalStartDate').val(), $('#historicalEndDate').val()); 
    }
    
    // --- FUNGSI GET COMMODITY DATA (MODIFIKASI LABEL TANGGAL) ---
    function getCommodityData(commodity) {
        // Label untuk Prediksi: 30 hari ke depan dari tanggal yang dipilih
        const predictionStart = new Date($('#predictionStartDate').val());
        const predictionLabels = Array.from({length: 30}, (_, i) => {
            const date = new Date(predictionStart);
            date.setDate(predictionStart.getDate() + i);
            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        });
        
        // Menghitung jumlah hari historis
        const historicalStart = new Date($('#historicalStartDate').val());
        const historicalEnd = new Date($('#historicalEndDate').val());
        const dayDifference = Math.ceil((historicalEnd.getTime() - historicalStart.getTime()) / (1000 * 3600 * 24));
        const historicalDays = dayDifference > 0 ? dayDifference + 1 : 30; // Min 30 hari

        // Label untuk Historis: antara tanggal start dan end historis
        const historicalLabels = Array.from({length: historicalDays}, (_, i) => {
            const date = new Date(historicalStart);
            date.setDate(historicalStart.getDate() + i);
            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        });

        // ... (basePrices dan factors TETAP SAMA) ...
        
        // Data historis harus dibuat berdasarkan jumlah hari yang dipilih
        const currentHistoricalData = generateRandomData(historicalDays, basePrices[commodity].min, basePrices[commodity].max);
        
        // Prediksi AI selalu menggunakan data historis terakhir untuk menghitung tren
        const currentPredictionData = generateLinearRegression(currentHistoricalData.slice(-30), 30); // Ambil 30 data historis terakhir
        
        return {
            prediction: { labels: predictionLabels, data: currentPredictionData },
            historical: { labels: historicalLabels, data: currentHistoricalData },
            factors: factors[commodity]
        };
    }
    
    // ... (updateFactorInfo TETAP SAMA) ...
    
    // --- UPDATE CHART (Modifikasi label) ---
    function updatePredictionChart(data, startDate) {
        // ... (Kode updatePredictionChart TETAP SAMA, hanya memanggil data.labels yang sudah diubah di getCommodityData) ...
        const ctx = document.getElementById('predictionChart').getContext('2d');
        if (predictionChart) predictionChart.destroy();
        
        // Gradient Background
        let gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(13, 110, 253, 0.5)');
        gradient.addColorStop(1, 'rgba(13, 110, 253, 0.0)');

        predictionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels, // Label menggunakan tanggal dari input kalender
                datasets: [{
                    label: 'AI Prediction (Rp)',
                    data: data.data,
                    backgroundColor: gradient,
                    borderColor: '#0d6efd',
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    tension: 0.4, 
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: { label: (c) => ` Prediksi: Rp ${c.raw.toLocaleString('id-ID')}` }
                    }
                },
                scales: {
                    y: { grid: { borderDash: [5, 5] }, ticks: { callback: (v) => 'Rp ' + v/1000 + 'rb' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }
    
    function updateHistoricalChart(data, commodity, startDate, endDate) {
        const ctx = document.getElementById('historicalChart').getContext('2d');
        const userReportData = loadUserReports(commodity, data.labels);
        if (historicalChart) historicalChart.destroy();
        
        historicalChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels, // Label menggunakan rentang tanggal yang dipilih
                datasets: [
                    {
                        label: 'Data Pasar',
                        data: data.data,
                        backgroundColor: 'rgba(25, 135, 84, 0.7)',
                        borderRadius: 4,
                        order: 2
                    },
                    {
                        label: 'Laporan Anda',
                        data: userReportData,
                        type: 'line',
                        borderColor: '#ffc107',
                        backgroundColor: '#ffc107',
                        borderWidth: 3,
                        pointRadius: 4,
                        tension: 0.2,
                        order: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: { label: (c) => ` Harga: Rp ${c.raw ? c.raw.toLocaleString('id-ID') : '-'}` }
                    }
                },
                scales: {
                    y: { grid: { borderDash: [5, 5] }, ticks: { callback: (v) => 'Rp ' + v/1000 + 'rb' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }
    
    // --- FUNGSI BARU: SIMULASI BERITA BAPANAS ---
    function loadBapanasNews() {
        const newsContainer = $('#newsContainer');
        
        // Data Berita di-update dari situs Bapanas: Karena CORS, ini adalah MOCKUP
        // Dalam implementasi nyata, data ini harus diambil melalui server backend (proxy) Anda.
        const updatedNews = [
            { t: "Bapanas Gelar Rapat Koordinasi Nasional Stabilisasi Harga Pangan", s: "Press Release", i: "fa-handshake", c: "bg-primary" },
            { t: "Realisasi Impor Gula Nasional Capai Target 80%", s: "Data Impor", i: "fa-cube", c: "bg-info" },
            { t: "Survei: Harga Telur Turun Signifikan di Jawa Tengah", s: "Statistik Harga", i: "fa-egg", c: "bg-success" },
            { t: "Peringatan Dini Cuaca Ekstrem: Waspada Pasokan Cabai", s: "Mitigasi Risiko", i: "fa-cloud-sun-rain", c: "bg-warning" }
        ];

        let html = updatedNews.map(n => `
            <div class="col-md-3">
                <a href="${BAPANAS_NEWS_URL}" target="_blank" class="text-decoration-none">
                    <div class="card h-100 border hover-shadow">
                        <div class="${n.c} text-white d-flex align-items-center justify-content-center" style="height: 100px;">
                            <i class="fas ${n.i} fa-3x opacity-75"></i>
                        </div>
                        <div class="card-body p-3">
                            <span class="badge bg-secondary mb-2">${n.s}</span>
                            <h6 class="fw-bold text-dark" style="font-size: 14px;">${n.t}</h6>
                        </div>
                    </div>
                </a>
            </div>
        `).join('');

        // Setelah loading simulasi, tampilkan berita
        setTimeout(() => {
            newsContainer.html(html);
        }, 1000); // Simulasi waktu loading
    }
    
    // ... (downloadCSV TETAP SAMA) ...
});
