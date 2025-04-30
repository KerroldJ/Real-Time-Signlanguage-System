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
- Python 3.12
- pip (Python package installer)
- Virtual environment (Highly recommended)

### Steps
- Download the zip file in the github Repository or clone it
- Go to the folder directory where you can find backend and my-app folder
- In that directory Open CMD and execute this command:
- python -3.12 -m venv .env
- Now to Open the File Run this Command:
- .env\Scripts\activate
- after you successfully activated the Virtual Environment, Procceed to the backend and Frontend Setup


###  Backend Setup (Flask)
- cd backend
- pip install flask flask-cors tensorflow numpy scikit-learn
- py server.py
Note: if running the server.py got an error of something like "Module Not Found" copy that error and paste in on ChatGpt it will tell how to install the missing module

###  Frontend Setup (Nextjs)
- cd my-app
- npm install
- npm run dev
