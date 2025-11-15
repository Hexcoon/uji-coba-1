 $(document).ready(function() {
    // Initialize charts
    let predictionChart, historicalChart;
    
    // Load initial data
    loadCommodityData('beras');
    
    // Handle commodity selection change
    $('#commoditySelect').on('change', function() {
        const selectedCommodity = $(this).val();
        loadCommodityData(selectedCommodity);
    });
    
    // Handle download data button
    $('#downloadData').on('click', function() {
        const selectedCommodity = $('#commoditySelect').val();
        downloadCommodityData(selectedCommodity);
    });
    
    // Function to load commodity data
    function loadCommodityData(commodity) {
        // Get commodity data
        const data = getCommodityData(commodity);
        
        // Update factor information
        updateFactorInfo(data.factors);
        
        // Update charts
        updatePredictionChart(data.prediction);
        updateHistoricalChart(data.historical);
    }
    
    // Function to get commodity data (simulated)
    function getCommodityData(commodity) {
        // Generate random data for demonstration
        const generateRandomData = (days, min, max) => {
            const data = [];
            for (let i = 0; i < days; i++) {
                data.push(Math.floor(Math.random() * (max - min + 1)) + min);
            }
            return data;
        };
        
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
        
        const commodityData = {
            beras: {
                prediction: {
                    labels: labels,
                    data: generateRandomData(30, 10000, 12000)
                },
                historical: {
                    labels: historicalLabels,
                    data: generateRandomData(30, 9500, 11500)
                },
                factors: {
                    weather: "Cerah dengan suhu rata-rata 28°C",
                    stock: "Stok mencukupi untuk 2 bulan ke depan",
                    distribution: "Distribusi normal ke seluruh wilayah"
                }
            },
            cabai: {
                prediction: {
                    labels: labels,
                    data: generateRandomData(30, 30000, 45000)
                },
                historical: {
                    labels: historicalLabels,
                    data: generateRandomData(30, 28000, 42000)
                },
                factors: {
                    weather: "Hujan ringan dengan suhu rata-rata 26°C",
                    stock: "Stok terbatas, hanya cukup untuk 3 minggu",
                    distribution: "Distribusi terhambat di beberapa wilayah"
                }
            },
            bawang: {
                prediction: {
                    labels: labels,
                    data: generateRandomData(30, 25000, 35000)
                },
                historical: {
                    labels: historicalLabels,
                    data: generateRandomData(30, 23000, 33000)
                },
                factors: {
                    weather: "Berawan dengan suhu rata-rata 27°C",
                    stock: "Stok aman untuk 1.5 bulan ke depan",
                    distribution: "Distribusi lancar ke seluruh wilayah"
                }
            }
        };
        
        return commodityData[commodity];
    }
    
    // Function to update factor information
    function updateFactorInfo(factors) {
        $('#weatherFactor').text(factors.weather);
        $('#stockFactor').text(factors.stock);
        $('#distributionFactor').text(factors.distribution);
    }
    
    // Function to update prediction chart
    function updatePredictionChart(data) {
        const ctx = document.getElementById('predictionChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (predictionChart) {
            predictionChart.destroy();
        }
        
        // Create new chart
        predictionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Prediksi Harga (Rp/kg)',
                    data: data.data,
                    backgroundColor: 'rgba(13, 110, 253, 0.2)',
                    borderColor: 'rgba(13, 110, 253, 1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Harga: Rp ${context.raw.toLocaleString('id-ID')}/kg`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return 'Rp ' + value.toLocaleString('id-ID');
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Function to update historical chart
    function updateHistoricalChart(data) {
        const ctx = document.getElementById('historicalChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (historicalChart) {
            historicalChart.destroy();
        }
        
        // Create new chart
        historicalChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Harga Historis (Rp/kg)',
                    data: data.data,
                    backgroundColor: 'rgba(25, 135, 84, 0.6)',
                    borderColor: 'rgba(25, 135, 84, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Harga: Rp ${context.raw.toLocaleString('id-ID')}/kg`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return 'Rp ' + value.toLocaleString('id-ID');
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Function to download commodity data
    function downloadCommodityData(commodity) {
        const data = getCommodityData(commodity);
        
        // Create JSON object
        const jsonData = {
            komoditas: commodity,
            prediksi: data.prediction,
            historis: data.historical,
            faktor: data.factors,
            tanggalUnduh: new Date().toISOString()
        };
        
        // Create download link
        const dataStr = JSON.stringify(jsonData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `data_${commodity}_${new Date().toISOString().slice(0,10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
});