 $(document).ready(function() {
    // Set today's date as default for start date
    const today = new Date().toISOString().split('T')[0];
    $('#startDate').val(today);
    
    // Set end date to 30 days from today
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    $('#endDate').val(endDate.toISOString().split('T')[0]);
    
    // Load saved draft from localStorage if exists
    loadDraftFromLocalStorage();
    
    // Handle form submission
    $('#contractForm').on('submit', function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        // Get form data
        const formData = getFormData();
        
        // Save draft to localStorage
        saveDraftToLocalStorage(formData);
        
        // Generate contract preview
        generateContractPreview(formData);
        
        // Show success message
        showNotification('Kontrak berhasil dibuat!', 'success');
    });
    
    // Handle form field changes to save draft
    $('#contractForm input, #contractForm select').on('change', function() {
        const formData = getFormData();
        saveDraftToLocalStorage(formData);
    });
    
    // Function to validate form
    function validateForm() {
        let isValid = true;
        
        // Check if end date is after start date
        const startDate = new Date($('#startDate').val());
        const endDate = new Date($('#endDate').val());
        
        if (endDate <= startDate) {
            isValid = false;
            showNotification('Tanggal selesai harus setelah tanggal mulai', 'danger');
        }
        
        return isValid;
    }
    
    // Function to get form data
    function getFormData() {
        return {
            farmerName: $('#farmerName').val(),
            farmerLocation: $('#farmerLocation').val(),
            farmerNIK: $('#farmerNIK').val(),
            distributorName: $('#distributorName').val(),
            commodityType: $('#commodityType').val(),
            commodityVolume: $('#commodityVolume').val(),
            agreedPrice: $('#agreedPrice').val(),
            startDate: $('#startDate').val(),
            endDate: $('#endDate').val()
        };
    }
    
    // Function to save draft to localStorage
    function saveDraftToLocalStorage(data) {
        localStorage.setItem('contractDraft', JSON.stringify(data));
    }
    
    // Function to load draft from localStorage
    function loadDraftFromLocalStorage() {
        const draft = localStorage.getItem('contractDraft');
        
        if (draft) {
            const data = JSON.parse(draft);
            
            // Populate form fields with draft data
            $('#farmerName').val(data.farmerName || '');
            $('#farmerLocation').val(data.farmerLocation || '');
            $('#farmerNIK').val(data.farmerNIK || '');
            $('#distributorName').val(data.distributorName || '');
            $('#commodityType').val(data.commodityType || '');
            $('#commodityVolume').val(data.commodityVolume || '');
            $('#agreedPrice').val(data.agreedPrice || '');
            $('#startDate').val(data.startDate || today);
            $('#endDate').val(data.endDate || '');
        }
    }
    
    // Function to generate contract preview
    function generateContractPreview(data) {
        // Generate contract number
        const contractNumber = 'KTR-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        
        // Format dates
        const startDateFormatted = new Date(data.startDate).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const endDateFormatted = new Date(data.endDate).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Calculate total value
        const totalValue = data.commodityVolume * data.agreedPrice;
        
        // Commodity type in Indonesian
        const commodityNames = {
            'beras': 'Beras',
            'cabai': 'Cabai',
            'bawang': 'Bawang Merah'
        };
        
        // Generate HTML for contract preview
        const contractHTML = `
            <div class="contract-details">
                <div class="contract-header">
                    <h4>KONTRAK DIGITAL</h4>
                    <p class="contract-number">Nomor Kontrak: ${contractNumber}</p>
                </div>
                <div class="row mb-3">
                    <div class="col-md-6">
                        <h6>PIHAK PERTAMA (PETANI)</h6>
                        <p><strong>Nama:</strong> ${data.farmerName}</p>
                        <p><strong>Lokasi:</strong> ${data.farmerLocation}</p>
                        ${data.farmerNIK ? `<p><strong>NIK:</strong> ${data.farmerNIK}</p>` : ''}
                    </div>
                    <div class="col-md-6">
                        <h6>PIHAK KEDUA (DISTRIBUTOR)</h6>
                        <p><strong>Nama:</strong> ${data.distributorName}</p>
                    </div>
                </div>
                <div class="mb-3">
                    <h6>DETAIL KONTRAK</h6>
                    <p><strong>Jenis Komoditas:</strong> ${commodityNames[data.commodityType]}</p>
                    <p><strong>Volume:</strong> ${data.commodityVolume.toLocaleString('id-ID')} kg</p>
                    <p><strong>Harga Kesepakatan:</strong> Rp ${parseInt(data.agreedPrice).toLocaleString('id-ID')}/kg</p>
                    <p><strong>Total Nilai Kontrak:</strong> Rp ${totalValue.toLocaleString('id-ID')}</p>
                    <p><strong>Periode Kontrak:</strong> ${startDateFormatted} hingga ${endDateFormatted}</p>
                </div>
                <div class="text-center mt-4">
                    <button id="printContract" class="btn btn-primary">
                        <i class="fas fa-print me-2"></i>Cetak Kontrak
                    </button>
                </div>
            </div>
        `;
        
        // Update contract preview
        $('#contractPreview').html(contractHTML);
        
        // Handle print button click
        $('#printContract').on('click', function() {
            window.print();
        });
    }
    
    // Function to show notification
    function showNotification(message, type) {
        const alertClass = `alert-${type}`;
        const notification = `
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        // Insert notification at the top of the form
        $('#contractForm').prepend(notification);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            $('.alert').alert('close');
        }, 5000);
    }
});