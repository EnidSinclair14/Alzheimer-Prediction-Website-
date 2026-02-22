document.addEventListener("DOMContentLoaded", function() {
    const imageInput = document.getElementById('image-input');
    const imagePreview = document.getElementById('image-preview');
    const uploadForm = document.getElementById('upload-form');
    const loadingDiv = document.getElementById('loading');
    const resultSection = document.getElementById('result-section');
    const submitBtn = document.getElementById('submit-btn');

    // 1. Tampilkan preview gambar setelah file dipilih
    imageInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
                resultSection.style.display = 'none'; // Sembunyikan hasil lama jika ada
            }
            reader.readAsDataURL(file);
        }
    });

    // 2. Tangani proses Submit Form
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Mencegah halaman refresh
        
        const file = imageInput.files[0];
        if (!file) {
            alert("Pilih gambar terlebih dahulu!");
            return;
        }

        // Siapkan data untuk dikirim
        const formData = new FormData();
        formData.append('file', file);

        // Tampilkan loading, sembunyikan hasil sebelumnya
        submitBtn.disabled = true;
        loadingDiv.style.display = 'block';
        resultSection.style.display = 'none';

        // Kirim request ke backend Flask (nanti kita buat route /api/predict)
        fetch('/api/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // Sembunyikan loading
            loadingDiv.style.display = 'none';
            submitBtn.disabled = false;

            if(data.error) {
                alert("Error: " + data.error);
                return;
            }

            // Tampilkan data ke halaman
            document.getElementById('pred-class').textContent = data.prediction;
            document.getElementById('pred-confidence').textContent = data.confidence;
            
            // Backend akan mengirim gambar kembali dalam format base64
            document.getElementById('result-original').src = "data:image/jpeg;base64," + data.original_image;
            document.getElementById('result-gradcam').src = "data:image/jpeg;base64," + data.gradcam_image;

            // Munculkan bagian hasil
            resultSection.style.display = 'block';
        })
        .catch(error => {
            console.error('Error:', error);
            loadingDiv.style.display = 'none';
            submitBtn.disabled = false;
            alert("Terjadi kesalahan saat memproses gambar.");
        });
    });
});