$(document).ready(function() {
    // Initialize charts
    let predictionChart, historicalChart;
    
    // Load initial data
    loadCommodityData('beras', 'nasional');
    
    // Handle commodity selection change
    $('#commoditySelect').on('change', function() {
        const selectedCommodity = $(this).val();
        const selectedRegion = $('#regionSelect').val();
        loadCommodityData(selectedCommodity, selectedRegion);
    });
    
    // Handle region selection change (NEW FEATURE)
    $('#regionSelect').on('change', function() {
        const selectedCommodity = $('#commoditySelect').val();
        const selectedRegion = $(this).val();
        loadCommodityData(selectedCommodity, selectedRegion);
    });
    
    // Handle download data button
    $('#downloadData').on('click', function() {
        const selectedCommodity = $('#commoditySelect').val();
        const selectedRegion = $('#regionSelect').val();
        downloadCommodityData(selectedCommodity, selectedRegion);
    });
    
    // Function to load commodity data
    function loadCommodityData(commodity, region) {
        // Get commodity data
        const data = getCommodityData(commodity, region);
        
        // Update factor information
        updateFactorInfo(data.factors);
        
        // Update charts
        updatePredictionChart(data.prediction, commodity);
        updateHistoricalChart(data.historical, commodity);
    }
    
    // Function to get commodity data (simulated with 2025 base price)
    function getCommodityData(commodity, region) {
        let baseMin, baseMax, factorOffset;

        // Base price simulation for 2025 (adjusted upwards from 2023)
        switch (commodity) {
            case 'beras':
                baseMin = 13500; baseMax = 15000;
                break;
            case 'cabai':
                baseMin = 45000; baseMax = 65000;
                break;
            case 'bawang':
                baseMin = 30000; baseMax = 40000;
                break;
            case 'gula': // NEW COMMODITY BASE PRICE
                baseMin = 16000; baseMax = 18000;
                break;
            default:
                baseMin = 10000; baseMax = 12000;
        }

        // Region Adjustment (NEW FEATURE)
        if (region === 'jawa') {
            factorOffset = -0.05; // 5% lower prices in Java (closer to production centers)
        } else if (region === 'luar_jawa') {
            factorOffset = 0.10; // 10% higher prices outside Java (logistics cost)
        } else {
            factorOffset = 0; // National average
        }

        baseMin = baseMin * (1 + factorOffset);
        baseMax = baseMax * (1 + factorOffset);

        // Generate random data for demonstration
        const generateRandomData = (days, min, max) => {
            const data = [];
            for (let i = 0; i < days; i++) {
                data.push(Math.round(Math.random() * (max - min + 1)) + min);
            }
            return data;
        };
        
        const labels = Array.from({length: 30}, (_, i) => `Hari ${30 - i}`);
        const historicalPrices = generateRandomData(30, baseMin * 0.95, baseMax * 1.05);

        // --- REGRESSION SIMULATION FOR PREDICTION ---
        const generateRegressionData = (historicalData, days) => {
            // Simplified Linear Regression: y = mx + c (m is slope)
            const n = historicalData.length;
            
            // Generate X values (0 to n-1) for historical data
            const X_hist = Array.from({length: n}, (_, i) => i);

            // Calculate Sums
            const sumX = X_hist.reduce((a, b) => a + b, 0);
            const sumY = historicalData.reduce((a, b) => a + b, 0);
            const sumXY = X_hist.reduce((sum, x, i) => sum + x * historicalData[i], 0);
            const sumXX = X_hist.reduce((sum, x) => sum + x * x, 0);

            // Calculate slope (m) and intercept (c)
            const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;
            
            // Generate future predictions (from x = n to x = n + days - 1)
            const predictionData = [];
            for (let i = 0; i < days; i++) {
                const x = n + i;
                let predictedPrice = intercept + slope * x;
                
                // Add minor random noise to make it look more realistic
                const noise = (Math.random() - 0.5) * (baseMax * 0.02); 
                predictedPrice += noise;

                // Ensure price stays positive
                predictedPrice = Math.max(0, predictedPrice);
                
                predictionData.push(Math.round(predictedPrice));
            }
            return predictionData;
        };

        const predictionLabels = Array.from({length: 30}, (_, i) => `Hari +${i + 1}`);
        const predictionPrices = generateRegressionData(historicalPrices, 30);
        
        // --- ADD USER REPORTS TO HISTORICAL DATA (NEW FEATURE) ---
        const userReports = loadReportsFromLocalStorage(commodity);
        const historicalWithReports = [...historicalPrices]; 
        // NOTE: In a real app, reports would be mapped to specific dates. Here, we just overlay them.
        
        if (userReports.length > 0) {
            // Simple integration: Use the last user report's price as the most recent point
            historicalWithReports[29] = userReports[userReports.length - 1].price;
        }

        const factors = {
            weather: ["Cuaca Baik (Panen Stabil)", "Risiko Banjir (Produksi Menurun)", "Kemarau Panjang (Gagal Panen)"][Math.floor(Math.random() * 3)],
            stock: ["Stok Surplus", "Stok Normal", "Stok Defisit"][Math.floor(Math.random() * 3)],
            distribution: ["Lancarr", "Terhambat Cuaca", "Tersendat Regulasi"][Math.floor(Math.random() * 3)],
            accuracy: `${(Math.random() * 5 + 90).toFixed(2)}%` // 90-95% accuracy
        };

        return {
            prediction: { labels: predictionLabels, prices: predictionPrices },
            historical: { labels: labels.reverse(), prices: historicalWithReports.reverse() }, // Reverse to show chronologically
            factors: factors
        };
    }

    // Function to load user reports from localStorage, filtered by commodity
    function loadReportsFromLocalStorage(commodity) {
        const reports = JSON.parse(localStorage.getItem('priceReports') || '[]');
        return reports
            .filter(report => report.commodity === commodity)
            .map(report => ({
                date: report.date,
                price: parseInt(report.price)
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    // Function to update factor information
    function updateFactorInfo(factors) {
        $('#weatherFactor').text(factors.weather);
        $('#stockFactor').text(factors.stock);
        $('#distributionFactor').text(factors.distribution);
        $('#accuracyFactor').text(factors.accuracy);
    }

    // Function to create/update prediction chart
    function updatePredictionChart(data, commodity) {
        if (predictionChart) {
            predictionChart.destroy();
        }

        const ctx = document.getElementById('predictionChart').getContext('2d');
        predictionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: `Prediksi Harga ${commodity.toUpperCase()} (Rp/Kg)`,
                    data: data.prices,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderWidth: 2,
                    pointRadius: 3,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += `Rp ${context.parsed.y.toLocaleString('id-ID')}/kg`;
                                return label;
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
    
    // Function to create/update historical chart
    function updateHistoricalChart(data, commodity) {
        if (historicalChart) {
            historicalChart.destroy();
        }

        const ctx = document.getElementById('historicalChart').getContext('2d');
        historicalChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: `Harga Historis ${commodity.toUpperCase()} (Rp/Kg)`,
                    data: data.prices,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    borderWidth: 2,
                    pointRadius: 4,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += `Rp ${context.parsed.y.toLocaleString('id-ID')}/kg`;
                                return label;
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
    function downloadCommodityData(commodity, region) {
        const data = getCommodityData(commodity, region);
        
        // Create JSON object
        const jsonData = {
            komoditas: commodity,
            regional: region,
            prediksi: data.prediction,
            historis: data.historical,
            faktor: data.factors,
            tanggalUnduh: new Date().toISOString()
        };
        
        // Create download link
        const dataStr = JSON.stringify(jsonData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `data_${commodity}_${region}_2025_${new Date().toISOString().slice(0,10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
});