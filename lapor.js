$(document).ready(function() {
    // Set default date
    const today = new Date().toISOString().split('T')[0];
    $('#reportDate').val(today);
    
    // Load existing
    loadReportsFromLocalStorage();
    
    // Handle SUBMIT
    $('#priceReportForm').on('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            commodity: $('#reportCommodity').val(),
            location: $('#reportLocation').val(),
            price: $('#reportPrice').val(),
            date: $('#reportDate').val(),
            id: Date.now()
        };
        
        saveReportToLocalStorage(formData);
        addReportToTable(formData);
        
        // UPDATE 3.0: Notifikasi Keren
        Swal.fire({
            icon: 'success',
            title: 'Terima Kasih!',
            text: 'Laporan harga berhasil dikirim ke sistem.',
            confirmButtonColor: '#198754',
            timer: 2000
        });
        
        this.reset();
        $('#reportDate').val(today);
    });
    
    // Handle DELETE ALL
    $('#deleteAllReports').on('click', function() {
        // Konfirmasi Keren
        Swal.fire({
            title: 'Hapus semua laporan?',
            text: "Data yang dihapus tidak bisa dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('priceReports');
                $('#priceReportsTable tbody').empty();
                toggleNoReportsMessage(true);
                Swal.fire('Dihapus!', 'Semua laporan telah dibersihkan.', 'success');
            }
        });
    });
    
    // ... Sisa fungsi pembantu tetap sama ...
    function saveReportToLocalStorage(report) {
        let reports = JSON.parse(localStorage.getItem('priceReports')) || [];
        reports.push(report);
        localStorage.setItem('priceReports', JSON.stringify(reports));
    }
    
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
    
    function addReportToTable(report) {
        const commodityNames = {
            'beras': 'Beras',
            'cabai': 'Cabai',
            'bawang': 'Bawang Merah'
        };
        const formattedDate = new Date(report.date).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
        
        const row = `
            <tr data-id="${report.id}">
                <td>${$('#priceReportsTable tbody tr').length + 1}</td>
                <td><span class="badge bg-primary">${commodityNames[report.commodity]}</span></td>
                <td>${report.location}</td>
                <td class="fw-bold">Rp ${parseInt(report.price).toLocaleString('id-ID')}</td>
                <td>${formattedDate}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger delete-report">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        $('#priceReportsTable tbody').append(row);
        toggleNoReportsMessage(false);
        
        $(`tr[data-id="${report.id}"] .delete-report`).on('click', function() {
            deleteReport(report.id);
        });
    }
    
    function deleteReport(id) {
        // Hapus langsung tanpa konfirmasi ribet per item
        let reports = JSON.parse(localStorage.getItem('priceReports')) || [];
        reports = reports.filter(report => report.id !== id);
        localStorage.setItem('priceReports', JSON.stringify(reports));
        $(`tr[data-id="${id}"]`).remove();
        updateRowNumbers();
        if (reports.length === 0) toggleNoReportsMessage(true);
        
        const Toast = Swal.mixin({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 1500
        });
        Toast.fire({ icon: 'success', title: 'Laporan dihapus' });
    }
    
    function updateRowNumbers() {
        $('#priceReportsTable tbody tr').each(function(index) {
            $(this).find('td:first').text(index + 1);
        });
    }
    
    function toggleNoReportsMessage(show) {
        if (show) {
            $('#noReportsMessage').removeClass('d-none');
            $('#priceReportsTable').addClass('d-none');
        } else {
            $('#noReportsMessage').addClass('d-none');
            $('#priceReportsTable').removeClass('d-none');
        }
    }
});