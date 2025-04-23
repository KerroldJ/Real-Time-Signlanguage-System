# Realtime Sign Language Translation System

A Realtime Sign Language Translation System that enables two-way communication between sign language users and non-signers. Built using **Next.js** for the frontend and **Flask** for the backend, the system can translate:
- 🧠 Sign Language to Text/Speech
- 🎤 Speech to Text

## 🌟 Features

- 🔁 Real-time sign language recognition using pre-trained ML models
- 🗣 Voice-to-text translation for accessibility
- 🎥 Live video feed for hand tracking and gesture recognition
- 🔊 Text-to-speech output for seamless communication
- 🧩 Modular backend with Python Flask
- 🌐 Web-based interface using Next.js

## 🛠 Tech Stack

| Frontend | Backend | ML/AI Model | Others |
|----------|---------|-------------|--------|
| Next.js | Flask   | TensorFlow / PyTorch (pretrained) | MediaPipe Hands, Socket.IO, Clerk |


## ⚙️ Installation

### Prerequisites
- Node.js and npm
- Python 3.8+
- pip (Python package installer)
- Virtual environment (recommended)

###  Backend Setup (Flask)
- cd backend
- python -m venv .venv
- source venv/bin/activate   # Windows: venv\Scripts\activate
- pip install -r requirements.txt
- py server.py

###  Frontend Setup (Nextjs)
- cd my-app
- npm install
- npm run dev
