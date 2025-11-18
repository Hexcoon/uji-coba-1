$(document).ready(function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    $('#reportDate').val(today);
    
    // Load existing reports from localStorage
    loadReportsFromLocalStorage();
    
    // Handle form submission
    $('#priceReportForm').on('submit', function(e) {
        e.preventDefault();
        
        const priceInput = $('#reportPrice');
        if (parseInt(priceInput.val()) < 100) {
            priceInput.addClass('is-invalid');
            return;
        }
        priceInput.removeClass('is-invalid');

        // Get form data
        const formData = {
            commodity: $('#reportCommodity').val(),
            location: $('#reportLocation').val(),
            price: priceInput.val(),
            date: $('#reportDate').val(),
            id: Date.now() // Unique ID for the report
        };
        
        // Save to localStorage
        saveReportToLocalStorage(formData);
        
        // Add to table
        addReportToTable(formData);
        
        // Show notification (TOAST)
        showToast('Data harga berhasil dikirim dan akan digunakan dalam prediksi!', 'success');
        
        // Reset form
        this.reset();
        $('#reportDate').val(today);
    });
    
    // Handle delete all reports button
    $('#deleteAllReports').on('click', function() {
        if (confirm('Apakah Anda yakin ingin menghapus semua laporan? Tindakan ini akan mempengaruhi data historis di Dashboard.')) {
            localStorage.removeItem('priceReports');
            $('#priceReportsTable').empty();
            toggleNoReportsMessage(true);
            showToast('Semua laporan telah dihapus', 'info');
        }
    });

    // Event delegation for delete single report
    $('#priceReportsTable').on('click', '.btn-delete-report', function() {
        const reportId = $(this).data('id');
        deleteReport(reportId);
    });
    
    // --- Core Functions ---

    function loadReportsFromLocalStorage() {
        const reports = JSON.parse(localStorage.getItem('priceReports') || '[]');
        $('#priceReportsTable').empty(); // Clear table
        
        if (reports.length === 0) {
            toggleNoReportsMessage(true);
        } else {
            reports.forEach(addReportToTable);
            toggleNoReportsMessage(false);
        }
    }
    
    function saveReportToLocalStorage(newReport) {
        const reports = JSON.parse(localStorage.getItem('priceReports') || '[]');
        reports.push(newReport);
        localStorage.setItem('priceReports', JSON.stringify(reports));
    }
    
    function addReportToTable(report) {
        // Toggle message off
        toggleNoReportsMessage(false);
        
        const formattedDate = new Date(report.date).toLocaleDateString('id-ID');
        
        const row = `<tr data-id="${report.id}">
            <td></td>
            <td>${formattedDate}</td>
            <td>${report.commodity.toUpperCase()}</td>
            <td>Rp ${parseInt(report.price).toLocaleString('id-ID')}</td>
            <td>${report.location}</td>
            <td>
                <button class="btn btn-sm btn-danger btn-delete-report" data-id="${report.id}"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
        
        $('#priceReportsTable').append(row);
        updateRowNumbers();
    }
    
    function deleteReport(reportId) {
        let reports = JSON.parse(localStorage.getItem('priceReports') || '[]');
        
        // Remove the report
        const initialLength = reports.length;
        reports = reports.filter(report => report.id !== reportId);
        
        if (reports.length < initialLength) {
            localStorage.setItem('priceReports', JSON.stringify(reports));
            
            // Remove the row from the table
            $(`#priceReportsTable tr[data-id="${reportId}"]`).remove();
            
            updateRowNumbers();
            
            // Show no reports message if table is empty
            if (reports.length === 0) {
                toggleNoReportsMessage(true);
            }
            
            showToast('Laporan berhasil dihapus', 'info');
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
    
    // Function to show notification (TOAST - NEW STYLE)
    function showToast(message, type) {
        const toast = $('#liveToast');
        const toastBody = $('#toastBody');
        
        // Set body message and color
        toastBody.html(message);
        
        // Set header icon and color based on type
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
        const color = type === 'success' ? 'text-success' : 'text-info';
        
        toast.find('.toast-header strong').html(`<i class="fas ${icon} me-2"></i>Sistem Lapor`);
        toast.find('.toast-header strong').removeClass('text-primary text-success text-info').addClass(color);

        // Show toast
        const bsToast = new bootstrap.Toast(toast[0]);
        bsToast.show();
    }
});