import cv2
import mediapipe as mp
import numpy as np
import tensorflow as tf
import pickle

# Load the trained model
model = tf.keras.models.load_model("model.h5")
# Load the label encoder
with open("model.pkl", "rb") as f:
    label_encoder = pickle.load(f)
    
# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils
# Open webcam
cap = cv2.VideoCapture(0)

def predict_gesture(landmarks):
    """Predict gesture using the model and return the final predicted label."""
    landmarks = np.array(landmarks).reshape(1, -1)  
    
    # Get prediction from the model
    prediction = model.predict(landmarks)
    predicted_class = np.argmax(prediction)
    
    # Convert prediction to label
    return label_encoder.inverse_transform([predicted_class])[0]

with mp_hands.Hands(
    static_image_mode=False, max_num_hands=1, min_detection_confidence=0.5, min_tracking_confidence=0.5
) as hands:
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1) 
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb_frame)

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

                # Extract landmarks
                landmarks = [coord for lm in hand_landmarks.landmark for coord in (lm.x, lm.y, lm.z)]

                # Predict gesture using the model
                predicted_gesture = predict_gesture(landmarks)

                # Display gesture on screen
                cv2.putText(frame, f"Gesture: {predicted_gesture}", (10, 50),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

        cv2.imshow("Hand Gesture Recognition", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

cap.release()
cv2.destroyAllWindows()
