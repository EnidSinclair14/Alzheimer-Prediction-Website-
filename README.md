# Alzheimer-Prediction-Website-
Web-based early detection of Alzheimer’s using ResNet-18 on brain MRI scans. Features Grad-CAM visualization for model transparency, providing heatmaps of affected areas. Developed as an Informatics Engineering thesis at Esa Unggul University to bridge deep learning and clinical diagnostic support.

Early Detection of Alzheimer's Disease using ResNet-18 and Grad-CAM
This repository contains the source code for my undergraduate thesis at Esa Unggul University. The project focuses on developing a web-based application that leverages Deep Learning to identify Alzheimer's Disease from Brain MRI images.

🚀 Project Overview
The core objective is to provide a diagnostic support tool that not only classifies MRI scans but also provides explainability through heatmaps, helping medical professionals understand which regions of the brain influenced the model's decision.

✨ Key Features
- Deep Learning Model: Built using the ResNet-18 architecture for high-accuracy image classification.

- Explainable AI (XAI): Integrated Grad-CAM (Gradient-weighted Class Activation Mapping) to visualize "attention" areas on MRI slices.

- Web Interface: A user-friendly dashboard (built with Flask/Streamlit) for uploading images and viewing real-time results.

- Data Visualization: Clear presentation of prediction confidence and localized brain atrophy indicators.

🛠️ Tech Stack
- Language: Python

- Libraries: PyTorch, NumPy, Pandas, Matplotlib, sklearn

- Visualization: Matplotlib, Grad-CAM

- Web Framework: JavaScript, Flask

- Data: https://www.kaggle.com/datasets/marcopinamonti/alzheimer-mri-4-classes-dataset?select=Alzheimer_MRI_4_classes_dataset
