document.addEventListener("DOMContentLoaded", function() {
    const imageInput = document.getElementById('image-input');
    const dropZone = document.getElementById('drop-zone');
    const previewSection = document.getElementById('preview-section');
    const imagePreview = document.getElementById('image-preview');
    const removeImgBtn = document.getElementById('remove-img-btn');
    
    const uploadForm = document.getElementById('upload-form');
    const submitBtn = document.getElementById('submit-btn');
    const loadingDiv = document.getElementById('loading');
    const resultSection = document.getElementById('result-section');

    // --- 1. Logika Klik & Drag & Drop ---
    
    // Klik area putus-putus untuk memicu input file
    dropZone.addEventListener('click', () => imageInput.click());

    // Efek saat gambar diseret ke atas area
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            imageInput.files = e.dataTransfer.files;
            handleFileSelect();
        }
    });

    imageInput.addEventListener('change', handleFileSelect);

    // --- 2. Logika Menampilkan Preview ---
    function handleFileSelect() {
        const file = imageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                
                // Sembunyikan drop zone, tampilkan preview
                dropZone.style.display = 'none';
                previewSection.style.display = 'flex';
                
                // Aktifkan tombol submit
                submitBtn.disabled = false;
                
                // Sembunyikan hasil lama jika ada
                resultSection.style.display = 'none'; 
            }
            reader.readAsDataURL(file);
        }
    }

    // --- 3. Logika Menghapus/Ganti Gambar ---
    removeImgBtn.addEventListener('click', () => {
        imageInput.value = ''; // Reset file input
        dropZone.style.display = 'flex'; // Munculkan drop zone lagi
        previewSection.style.display = 'none'; // Sembunyikan preview
        submitBtn.disabled = true; // Matikan tombol
        resultSection.style.display = 'none';
    });


    // --- 4. Logika Submit ke Backend ---
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault(); 
        
        const file = imageInput.files[0];
        if (!file) {
            alert("Pilih gambar terlebih dahulu!");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        // UI State: Loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
        loadingDiv.style.display = 'block';
        resultSection.style.display = 'none';

        // GANTI '/api/predict' ke URL Flask Backend Anda nantinya
        fetch('/api/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // UI State: Selesai Loading
            loadingDiv.style.display = 'none';
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-brain"></i> Analisis Gambar Sekarang';

            if(data.error) {
                alert("Error: " + data.error);
                return;
            }

            // Tampilkan Data ke Halaman
            document.getElementById('pred-class').textContent = data.prediction;
            document.getElementById('pred-confidence').textContent = data.confidence;
            
            document.getElementById('result-original').src = "data:image/jpeg;base64," + data.original_image;
            document.getElementById('result-gradcam').src = "data:image/jpeg;base64," + data.gradcam_image;

            // Munculkan bagian hasil dengan animasi halus
            resultSection.style.display = 'block';
            resultSection.scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            console.error('Error:', error);
            loadingDiv.style.display = 'none';
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-brain"></i> Analisis Gambar Sekarang';
            alert("Sedang dalam tahap desain (Backend belum terhubung).");
        });
    });
});