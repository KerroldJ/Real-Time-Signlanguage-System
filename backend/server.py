from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import numpy as np
import tensorflow as tf
import pickle
import logging
import json
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}) 
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

IMAGES_FOLDER = os.path.join(os.getcwd(), "Images")
MODEL_PATH = "model.h5"
LABEL_ENCODER_PATH = "model.pkl"

def load_resources():
    global model, label_encoder
    try:
        model = tf.keras.models.load_model(MODEL_PATH, compile=False) 
        logger.info(f"Model loaded successfully from {MODEL_PATH}")
    except Exception as e:
        logger.error(f"Failed to load model from {MODEL_PATH}: {str(e)}")
        raise RuntimeError(f"Model loading failed: {str(e)}")

    try:
        with open(LABEL_ENCODER_PATH, "rb") as f:
            label_encoder = pickle.load(f)
        logger.info(f"Label encoder loaded successfully from {LABEL_ENCODER_PATH}")
    except Exception as e:
        logger.error(f"Failed to load label encoder from {LABEL_ENCODER_PATH}: {str(e)}")
        raise RuntimeError(f"Label encoder loading failed: {str(e)}")

try:
    load_resources()
except Exception as e:
    logger.critical(f"Application startup failed: {str(e)}")
    raise

@app.route("/predict", methods=["POST"])
def predict():
    logger.info("Received POST request to /predict")

    if not request.content_type.startswith('multipart/form-data'):
        logger.warning(f"Invalid content type: {request.content_type}")
        return jsonify({"error": "Content-Type must be multipart/form-data"}), 400

    if 'features' not in request.form:
        logger.warning("No 'features' key found in form data")
        return jsonify({"error": "Missing 'features' in form data"}), 400

    features_str = request.form['features']
    try:
        if features_str.startswith('['):
            features = json.loads(features_str)
        else:
            features = [float(x.strip()) for x in features_str.split(',')]
        features = np.array(features, dtype=np.float32)
    except (json.JSONDecodeError, ValueError) as e:
        logger.warning(f"Failed to parse features: {str(e)} - Input: {features_str}")
        return jsonify({"error": "Invalid features format. Use JSON array or comma-separated values"}), 400

    try:
        if len(features.shape) == 1:
            features = np.expand_dims(features, axis=0)
        expected_features = 63
        if features.shape[1] != expected_features:
            logger.warning(f"Feature shape mismatch: expected (?, {expected_features}), got {features.shape}")
            return jsonify({"error": f"Expected {expected_features} features, got {features.shape[1]}"}), 400
        logger.debug(f"Processed input shape: {features.shape}")
    except Exception as e:
        logger.error(f"Error processing feature shape: {str(e)}")
        return jsonify({"error": f"Feature shape processing failed: {str(e)}"}), 400

    try:
        predictions = model.predict(features, verbose=0)
        predicted_class_index = np.argmax(predictions, axis=-1)[0] 
        confidence = float(np.max(predictions, axis=-1)[0]) 
        predicted_label = label_encoder.inverse_transform([predicted_class_index])[0]

        logger.info(f"Prediction successful: {predicted_label} (confidence: {confidence:.4f})")
        return jsonify({
            "prediction": predicted_label,
            "confidence": confidence
        })
    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}")
        return jsonify({"error": f"Prediction error: {str(e)}"}), 500
    
@app.route("/images/<filename>")
def get_image(filename):
    try:
        return send_from_directory(IMAGES_FOLDER, filename)
    except Exception as e:
        return jsonify({"error": str(e)}), 404


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5001)