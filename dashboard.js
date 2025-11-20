$(document).ready(function() {
    // Inisialisasi Chart
    let predictionChart, historicalChart;
    
    // Load data awal
    loadCommodityData('beras');
    
    // Handle perubahan pilihan komoditas
    $('#commoditySelect').on('change', function() {
        const selectedCommodity = $(this).val();
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
    
    // Handle tombol download (UPDATE 3.0: Export ke CSV)
    $('#downloadData').on('click', function() {
        const selectedCommodity = $('#commoditySelect').val();
        
        // Tampilkan loading dulu
        let timerInterval;
        Swal.fire({
            title: 'Menyiapkan Laporan...',
            html: 'Mengunduh data analisis <b>' + selectedCommodity + '</b>.',
            timer: 1500,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
            },
            willClose: () => {
                clearInterval(timerInterval);
            }
        }).then((result) => {
            // Eksekusi download setelah loading selesai
            downloadCSV(selectedCommodity);
            
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Laporan telah disimpan ke perangkat Anda.',
                confirmButtonColor: '#0d6efd'
            });
        });
    });
    
    // --- FUNGSI MATEMATIKA: REGRESI LINEAR ---
    function generateLinearRegression(historicalData, futureDays) {
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        const n = historicalData.length;

        for (let i = 0; i < n; i++) {
            const x = i;
            const y = historicalData[i];
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumXX += x * x;
        }

        const denominator = (n * sumXX - sumX * sumX);
        if (denominator === 0) return generateRandomData(futureDays, historicalData[n-1]*0.9, historicalData[n-1]*1.1);
        
        const m = (n * sumXY - sumX * sumY) / denominator;
        const b = (sumY - m * sumX) / n;

        const prediction = [];
        for (let i = 0; i < futureDays; i++) {
            let predictedY = m * (i + n) + b;
            const noise = (Math.random() - 0.5) * (predictedY * 0.05);
            predictedY = Math.round(predictedY + noise);
            if (predictedY < 5000) predictedY = 5000;
            prediction.push(predictedY);
        }
        return prediction;
    }

    const generateRandomData = (days, min, max) => {
        const data = [];
        let lastValue = Math.floor(Math.random() * (max - min + 1)) + min;
        for (let i = 0; i < days; i++) {
            const fluctuation = (Math.random() - 0.5) * (max - min) * 0.05;
            lastValue = Math.round(Math.max(min, Math.min(max, lastValue + fluctuation)));
            data.push(lastValue);
        }
        return data;
    };
    
    // --- INTEGRASI DATA LOCALSTORAGE ---
    function loadUserReports(commodity, historicalLabels) {
        const reports = JSON.parse(localStorage.getItem('priceReports')) || [];
        const finalData = [];
        const userReportsMap = new Map();
        
        reports.filter(report => report.commodity === commodity)
            .forEach(report => {
                const dateLabel = new Date(report.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                userReportsMap.set(dateLabel, parseInt(report.price));
            });

        historicalLabels.forEach(label => {
            if (userReportsMap.has(label)) {
                finalData.push(userReportsMap.get(label));
            } else {
                finalData.push(null);
            }
        });
        return finalData;
    }

    // --- FUNGSI UTAMA LOAD DATA ---
    function loadCommodityData(commodity) {
        const data = getCommodityData(commodity);
        updateFactorInfo(data.factors);
        updatePredictionChart(data.prediction);
        updateHistoricalChart(data.historical, commodity); 
    }
    
    function getCommodityData(commodity) {
        const labels = Array.from({length: 30}, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i);
            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        });
        
        const historicalLabels = Array.from({length: 30}, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - 30 + i);
            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        });

        const basePrices = {
            beras: { min: 12500, max: 14000 },
            cabai: { min: 35000, max: 55000 },
            bawang: { min: 28000, max: 42000 }
        };
        
        const factors = {
            beras: {
                weather: "Cerah (Kondisi Panen Optimal)",
                stock: "Surplus 15% di Gudang Bulog",
                distribution: "Lancar via Tol Laut"
            },
            cabai: {
                weather: "Hujan Sedang (Risiko Pembusukan)",
                stock: "Menipis di Pasar Induk",
                distribution: "Terhambat di Jawa Barat"
            },
            bawang: {
                weather: "Berawan (Stabil)",
                stock: "Cukup untuk 3 Bulan",
                distribution: "Normal"
            }
        };

        const currentHistoricalData = generateRandomData(30, basePrices[commodity].min, basePrices[commodity].max);
        const currentPredictionData = generateLinearRegression(currentHistoricalData, 30);
        
        return {
            prediction: { labels: labels, data: currentPredictionData },
            historical: { labels: historicalLabels, data: currentHistoricalData },
            factors: factors[commodity]
        };
    }
    
    function updateFactorInfo(factors) {
        $('#weatherFactor').text(factors.weather);
        $('#stockFactor').text(factors.stock);
        $('#distributionFactor').text(factors.distribution);
    }
    
    // --- UPDATE CHART (Desain 3.0) ---
    function updatePredictionChart(data) {
        const ctx = document.getElementById('predictionChart').getContext('2d');
        if (predictionChart) predictionChart.destroy();
        
        // Gradient Background
        let gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(13, 110, 253, 0.5)');
        gradient.addColorStop(1, 'rgba(13, 110, 253, 0.0)');

        predictionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'AI Prediction (Rp)',
                    data: data.data,
                    backgroundColor: gradient,
                    borderColor: '#0d6efd',
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    tension: 0.4, // Kurva mulus
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
    
    function updateHistoricalChart(data, commodity) {
        const ctx = document.getElementById('historicalChart').getContext('2d');
        const userReportData = loadUserReports(commodity, data.labels);
        if (historicalChart) historicalChart.destroy();
        
        historicalChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
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
    
    // --- FITUR DOWNLOAD CSV (EXCEL) ---
    function downloadCSV(commodity) {
        const data = getCommodityData(commodity);
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Tanggal,Kategori,Harga (Rp)\n"; // Header

        // Tambahkan Data Historis
        data.historical.labels.forEach((date, index) => {
            csvContent += `${date},Data Historis,${data.historical.data[index]}\n`;
        });

        // Tambahkan Data Prediksi
        data.prediction.labels.forEach((date, index) => {
            csvContent += `${date},Prediksi AI,${data.prediction.data[index]}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Laporan_${commodity}_2025.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});