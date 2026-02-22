from flask import Flask, render_template, request, jsonify
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms, models
from PIL import Image
import numpy as np
import io
import base64

# KEMBALI KE GRAD-CAM STANDAR (Menghasilkan warna yang lebih menyebar dan halus)
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image

app = Flask(__name__)

# ==========================================
# 1. KONFIGURASI MODEL & DEVICE
# ==========================================
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
class_names = ['MildDemented', 'ModerateDemented', 'NonDemented', 'VeryMildDemented']
MODEL_PATH = 'best_model_resnet18_alzheimer.pth'

print("Memuat arsitektur ResNet-18...")
model = models.resnet18(weights=None)
num_ftrs = model.fc.in_features
model.fc = nn.Linear(num_ftrs, len(class_names))

try:
    model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
    model = model.to(DEVICE)
    model.eval()
    print("Model berhasil dimuat dan siap digunakan!")
except Exception as e:
    print(f"Peringatan: Gagal memuat model ({e}).")

# ==========================================
# 2. SETUP GRAD-CAM & TRANSFORMASI
# ==========================================
target_layers = [model.layer4[-1]]
cam = GradCAM(model=model, target_layers=target_layers)

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# ==========================================
# 3. FUNGSI KONVERSI (BUG DIPERBAIKI)
# ==========================================
def array_to_base64(img_array):
    """Fungsi ini sekarang menangani array uint8 tanpa merusak warnanya"""
    img = Image.fromarray(img_array)
    buffered = io.BytesIO()
    img.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

# ==========================================
# 4. ROUTES FLASK
# ==========================================
@app.route('/')
@app.route('/templates/index.html')
def home():
    return render_template('index.html')

@app.route('/templates/predict.html')
def predict_page():
    return render_template('predict.html')

# ==========================================
# 5. API ENDPOINT
# ==========================================
@app.route('/api/predict', methods=['POST'])
def predict_api():
    if 'file' not in request.files:
        return jsonify({'error': 'Tidak ada file yang diunggah'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'File kosong'}), 400

    try:
        # A. Buka dan Resize Gambar
        image = Image.open(file.stream).convert('RGB')
        image_resized = image.resize((224, 224))
        
        input_tensor = transform(image_resized).unsqueeze(0).to(DEVICE)

        # B. Dapatkan Hasil Prediksi
        model.eval()
        outputs = model(input_tensor)
        probabilities = F.softmax(outputs, dim=1)
        
        confidence, predicted_class_idx = torch.max(probabilities, 1)
        predicted_label = class_names[predicted_class_idx.item()]
        confidence_score = f"{confidence.item() * 100:.2f}%"

        # C. Buat Heatmap Grad-CAM
        grayscale_cam = cam(input_tensor=input_tensor, targets=None)[0, :]
        
        # D. Tumpuk ke Gambar Asli
        rgb_img = np.float32(image_resized) / 255
        
        # Fungsi ini akan menghasilkan gambar RGB skala 0-255 (Tipe data Uint8)
        visualization = show_cam_on_image(rgb_img, grayscale_cam, use_rgb=True)

        # E. Ubah ke Base64 (Untuk Gambar Asli, kita kalikan 255 dulu agar sama formatnya)
        original_uint8 = np.uint8(rgb_img * 255)
        
        original_base64 = array_to_base64(original_uint8)
        gradcam_base64 = array_to_base64(visualization) # Tidak dikali 255 lagi agar tidak rusak

        return jsonify({
            'prediction': predicted_label,
            'confidence': confidence_score,
            'original_image': original_base64,
            'gradcam_image': gradcam_base64
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
    
#.\.venv\Scripts\python.exe app.py - Command to run the Flask application