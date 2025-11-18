$(document).ready(function() {
    // Set today's date as default for start date
    const today = new Date().toISOString().split('T')[0];
    $('#startDate').val(today);
    
    // Set end date to 30 days from today
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    $('#endDate').val(endDate.toISOString().split('T')[0]);
    
    // Load existing contracts (NEW FEATURE: Track Contracts)
    loadContractsFromLocalStorage();
    
    // Handle form submission
    $('#contractForm').on('submit', function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        const newContract = getFormData();
        newContract.id = 'KTR-' + Date.now(); // Unique ID
        newContract.status = 'Draft'; // Initial status
        
        saveContractToLocalStorage(newContract);
        addContractToTable(newContract);
        
        showNotification('Kontrak berhasil disimpan sebagai **Draft**!', 'success');
        
        // Reset form and dates
        this.reset();
        $('#startDate').val(today);
        $('#endDate').val(endDate.toISOString().split('T')[0]);
    });
    
    // Handle delete all contracts button
    $('#deleteAllContracts').on('click', function() {
        if (confirm('Apakah Anda yakin ingin menghapus semua riwayat kontrak? Tindakan ini tidak dapat dibatalkan.')) {
            localStorage.removeItem('digitalContracts');
            $('#contractsTable').empty();
            toggleNoContractsMessage(true);
            showNotification('Semua riwayat kontrak telah dihapus', 'danger');
        }
    });
    
    // Event delegation for action buttons (View and Mark as Complete)
    $('#contractsTable').on('click', '.btn-view-contract', function() {
        const contractId = $(this).data('id');
        viewContractDetails(contractId);
    });
    
    $('#contractsTable').on('click', '.btn-complete-contract', function() {
        const contractId = $(this).data('id');
        markContractAsComplete(contractId);
    });

    // --- Core Functions ---
    
    function getFormData() {
        return {
            commodity: $('#commodity').val(),
            quantity: parseInt($('#quantity').val()),
            agreedPrice: parseInt($('#agreedPrice').val()),
            startDate: $('#startDate').val(),
            endDate: $('#endDate').val(),
            partyName: $('#partyName').val()
        };
    }
    
    function validateForm() {
        let isValid = true;
        
        // Check if end date is after start date
        const startDate = new Date($('#startDate').val());
        const endDate = new Date($('#endDate').val());

        if (endDate <= startDate) {
            showNotification('Tanggal Berakhir harus setelah Tanggal Mulai Kontrak.', 'danger');
            isValid = false;
        }
        
        // Basic check for positive numbers
        if (parseInt($('#quantity').val()) < 1 || parseInt($('#agreedPrice').val()) < 100) {
            showNotification('Kuantitas dan Harga harus merupakan nilai positif yang valid.', 'danger');
            isValid = false;
        }

        return isValid;
    }

    function loadContractsFromLocalStorage() {
        const contracts = JSON.parse(localStorage.getItem('digitalContracts') || '[]');
        $('#contractsTable').empty(); // Clear table
        
        if (contracts.length === 0) {
            toggleNoContractsMessage(true);
        } else {
            contracts.forEach(addContractToTable);
            toggleNoContractsMessage(false);
        }
    }
    
    function saveContractToLocalStorage(newContract) {
        const contracts = JSON.parse(localStorage.getItem('digitalContracts') || '[]');
        // Check if contract already exists (for updates, not used here, but good practice)
        const existingIndex = contracts.findIndex(c => c.id === newContract.id);
        
        if (existingIndex !== -1) {
             contracts[existingIndex] = newContract;
        } else {
            contracts.push(newContract);
        }
        
        localStorage.setItem('digitalContracts', JSON.stringify(contracts));
    }
    
    function addContractToTable(contract) {
        // Toggle message off
        toggleNoContractsMessage(false);
        
        const totalValue = contract.quantity * contract.agreedPrice;
        let statusBadge = '';
        if (contract.status === 'Draft') {
            statusBadge = '<span class="badge bg-warning text-dark">Draft</span>';
        } else if (contract.status === 'Selesai') {
            statusBadge = '<span class="badge bg-success">Selesai</span>';
        }
        
        const row = `<tr data-id="${contract.id}">
            <td>${contract.id.split('-')[1].slice(-4)}</td>
            <td>${contract.commodity.toUpperCase()}</td>
            <td>Rp ${contract.agreedPrice.toLocaleString('id-ID')}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-sm btn-info btn-view-contract me-1" data-id="${contract.id}"><i class="fas fa-eye"></i></button>
                <button class="btn btn-sm btn-success btn-complete-contract" data-id="${contract.id}" ${contract.status === 'Selesai' ? 'disabled' : ''}><i class="fas fa-check"></i></button>
            </td>
        </tr>`;
        
        $('#contractsTable').append(row);
    }
    
    function toggleNoContractsMessage(show) {
        if (show) {
            $('#noContractsMessage').show();
            $('#contractsTable').hide();
        } else {
            $('#noContractsMessage').hide();
            $('#contractsTable').show();
        }
    }
    
    function markContractAsComplete(contractId) {
        const contracts = JSON.parse(localStorage.getItem('digitalContracts') || '[]');
        const contractIndex = contracts.findIndex(c => c.id === contractId);

        if (contractIndex !== -1 && contracts[contractIndex].status !== 'Selesai') {
            contracts[contractIndex].status = 'Selesai';
            localStorage.setItem('digitalContracts', JSON.stringify(contracts));
            
            // Reload table to update badge and button status
            loadContractsFromLocalStorage(); 
            showNotification(`Kontrak ${contractId.split('-')[1].slice(-4)} ditandai sebagai **Selesai**!`, 'info');
        }
    }

    function viewContractDetails(contractId) {
        const contracts = JSON.parse(localStorage.getItem('digitalContracts') || '[]');
        const contract = contracts.find(c => c.id === contractId);
        
        if (!contract) return;
        
        const totalValue = contract.quantity * contract.agreedPrice;
        const startDateFormatted = new Date(contract.startDate).toLocaleDateString('id-ID');
        const endDateFormatted = new Date(contract.endDate).toLocaleDateString('id-ID');

        const contractHTML = `
            <div class="p-3 border rounded bg-light">
                <h6 class="text-primary">Detail Kontrak ID: ${contract.id.split('-')[1].slice(-4)}</h6>
                <p><strong>Komoditas:</strong> ${contract.commodity.toUpperCase()}</p>
                <p><strong>Kuantitas:</strong> ${contract.quantity.toLocaleString('id-ID')} Kg</p>
                <p><strong>Harga/Kg:</strong> Rp ${contract.agreedPrice.toLocaleString('id-ID')}</p>
                <p><strong>Total Nilai Kontrak:</strong> <span class="fw-bold text-success">Rp ${totalValue.toLocaleString('id-ID')}</span></p>
                <p><strong>Pihak Kedua:</strong> ${contract.partyName}</p>
                <p><strong>Periode:</strong> ${startDateFormatted} - ${endDateFormatted}</p>
                <p><strong>Status:</strong> <span class="fw-bold">${contract.status}</span></p>
            </div>
        `;
        
        // Show in form area as a detailed preview (simulating modal behavior)
        $('#contractForm').html(`
            <h5 class="card-title mb-4">Preview Kontrak (ID: ${contract.id.split('-')[1].slice(-4)})</h5>
            ${contractHTML}
            <button class="btn btn-sm btn-secondary mt-3" onclick="location.reload()"><i class="fas fa-arrow-left me-2"></i>Kembali ke Form</button>
        `);
        
        showNotification('Detail kontrak ditampilkan di formulir.', 'info');
    }
    
    // Function to show notification (Revised for Lapor.js style)
    function showNotification(message, type) {
        const alertClass = `alert-${type}`;
        const notification = `
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        // Insert notification at the top of the form
        $('#notification').html(notification);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            $('.alert').alert('close');
        }, 5000);
    }
});