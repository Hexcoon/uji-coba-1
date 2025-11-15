 $(document).ready(function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    $('#reportDate').val(today);
    
    // Load existing reports from localStorage
    loadReportsFromLocalStorage();
    
    // Handle form submission
    $('#priceReportForm').on('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            commodity: $('#reportCommodity').val(),
            location: $('#reportLocation').val(),
            price: $('#reportPrice').val(),
            date: $('#reportDate').val(),
            id: Date.now() // Unique ID for the report
        };
        
        // Save to localStorage
        saveReportToLocalStorage(formData);
        
        // Add to table
        addReportToTable(formData);
        
        // Show notification
        showNotification('Data harga berhasil dikirim!', 'success');
        
        // Reset form
        this.reset();
        $('#reportDate').val(today);
    });
    
    // Handle delete all reports button
    $('#deleteAllReports').on('click', function() {
        if (confirm('Apakah Anda yakin ingin menghapus semua laporan?')) {
            localStorage.removeItem('priceReports');
            $('#priceReportsTable').empty();
            toggleNoReportsMessage(true);
            showNotification('Semua laporan telah dihapus', 'info');
        }
    });
    
    // Function to save report to localStorage
    function saveReportToLocalStorage(report) {
        let reports = JSON.parse(localStorage.getItem('priceReports')) || [];
        reports.push(report);
        localStorage.setItem('priceReports', JSON.stringify(reports));
    }
    
    // Function to load reports from localStorage
    function loadReportsFromLocalStorage() {
        const reports = JSON.parse(localStorage.getItem('priceReports')) || [];
        
        if (reports.length === 0) {
            toggleNoReportsMessage(true);
        } else {
            toggleNoReportsMessage(false);
            reports.forEach(report => {
                addReportToTable(report);
            });
        }
    }
    
    // Function to add report to table
    function addReportToTable(report) {
        // Commodity type in Indonesian
        const commodityNames = {
            'beras': 'Beras',
            'cabai': 'Cabai',
            'bawang': 'Bawang Merah'
        };
        
        // Format date
        const formattedDate = new Date(report.date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Create table row
        const row = `
            <tr data-id="${report.id}">
                <td>${$('#priceReportsTable tr').length + 1}</td>
                <td>${commodityNames[report.commodity]}</td>
                <td>${report.location}</td>
                <td>Rp ${parseInt(report.price).toLocaleString('id-ID')}</td>
                <td>${formattedDate}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger delete-report">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        
        // Add row to table
        $('#priceReportsTable').append(row);
        
        // Hide no reports message
        toggleNoReportsMessage(false);
        
        // Add delete functionality to the new row
        $(`tr[data-id="${report.id}"] .delete-report`).on('click', function() {
            deleteReport(report.id);
        });
    }
    
    // Function to delete a single report
    function deleteReport(id) {
        if (confirm('Apakah Anda yakin ingin menghapus laporan ini?')) {
            // Get reports from localStorage
            let reports = JSON.parse(localStorage.getItem('priceReports')) || [];
            
            // Filter out the report with the given ID
            reports = reports.filter(report => report.id !== id);
            
            // Save updated reports to localStorage
            localStorage.setItem('priceReports', JSON.stringify(reports));
            
            // Remove row from table
            $(`tr[data-id="${id}"]`).remove();
            
            // Update row numbers
            updateRowNumbers();
            
            // Show no reports message if table is empty
            if (reports.length === 0) {
                toggleNoReportsMessage(true);
            }
            
            // Show notification
            showNotification('Laporan berhasil dihapus', 'info');
        }
    }
    
    // Function to update row numbers
    function updateRowNumbers() {
        $('#priceReportsTable tr').each(function(index) {
            $(this).find('td:first').text(index + 1);
        });
    }
    
    // Function to toggle no reports message
    function toggleNoReportsMessage(show) {
        if (show) {
            $('#noReportsMessage').show();
            $('#priceReportsTable').hide();
        } else {
            $('#noReportsMessage').hide();
            $('#priceReportsTable').show();
        }
    }
    
    // Function to show notification
    function showNotification(message, type) {
        // Remove any existing notifications
        $('#notification').removeClass().addClass(`alert alert-${type} alert-dismissible fade show`).html(`
            <strong>${type === 'success' ? 'Berhasil!' : 'Info!'}</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `).removeClass('d-none');
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            $('#notification').alert('close');
        }, 5000);
    }
});