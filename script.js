console.log('kontrak loaded');

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formKontrakBaru');
    const tableBody = document.getElementById('kontrakTableBody');
    let nextId = 3; // Lanjutkan dari ID terakhir di HTML (KTR-002)

    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Mencegah form submit default

            // Ambil nilai
            const komoditas = document.getElementById('komoditasBaru').value;
            const kuantitas = document.getElementById('kuantitasBaru').value;
            const harga = document.getElementById('hargaBaru').value;
            
            // Format ID baru
            const idNumber = String(nextId).padStart(3, '0');
            const newId = 'KTR-' + idNumber;
            nextId++;
            
            // Format angka untuk tampilan
            const kuantitasFormatted = parseInt(kuantitas).toLocaleString('id-ID');
            const hargaFormatted = parseInt(harga).toLocaleString('id-ID');

            // Buat baris baru
            const newRow = `
                <tr>
                    <td>${newId}</td>
                    <td>${komoditas}</td>
                    <td>${kuantitasFormatted}</td>
                    <td>${hargaFormatted}</td>
                    <td><span class="badge bg-danger">Draft Baru</span></td>
                    <td><button class="btn btn-sm btn-outline-info">Detail</button></td>
                </tr>
            `;

            // Tambahkan baris ke tabel
            tableBody.insertAdjacentHTML('beforeend', newRow);

            // Tampilkan notifikasi dan tutup modal
            alert(`Kontrak ${newId} untuk ${komoditas} berhasil ditambahkan!`);
            
            // Tutup modal secara manual
            const modalElement = document.getElementById('tambahKontrakModal');
            // Cek apakah bootstrap.Modal tersedia sebelum membuat instance baru
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                 const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
                 modalInstance.hide();
            } else {
                 console.error('Bootstrap Modal tidak tersedia.');
            }
           
            form.reset();
            console.log('Kontrak baru dibuat:', { newId, komoditas, kuantitas, harga });
        });
    }
});
