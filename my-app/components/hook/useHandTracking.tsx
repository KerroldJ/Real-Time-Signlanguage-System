'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Hands } from '@mediapipe/hands';

export const useHandTracking = (
    videoElement: HTMLVideoElement | null,
    stream: MediaStream | null,
    isEnabled: boolean = false
) => {
    const [prediction, setPrediction] = useState<string | null>(null);

    useEffect(() => {
        if (!videoElement || !stream || !isEnabled) {
            setPrediction(null);
            return;
        }

        const hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
        });
        console.log("Hands instance created successfully:", hands);

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        let lastKeyFrameFeatures: number[] | null = null;
        let lastSentTime = 0;
        let previousLandmarks: number[] | null = null;

        hands.onResults((results) => {
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                const landmarks = results.multiHandLandmarks[0];
                const features = landmarks.flatMap((landmark: any) => [
                    landmark.x,
                    landmark.y,
                    landmark.z,
                ]);

                if (previousLandmarks) {
                    const movement = features.reduce((sum: number, val: number, idx: number) => {
                        const diff = val - (previousLandmarks ? previousLandmarks[idx] : 0);
                        return sum + diff * diff;
                    }, 0);

                    if (movement > 0.01) {
                        lastKeyFrameFeatures = features;
                    }
                }
                previousLandmarks = features;
                const currentTime = Date.now();

                if (lastKeyFrameFeatures && currentTime - lastSentTime >= 1000) {
                    const formData = new FormData();
                    formData.append('features', JSON.stringify(lastKeyFrameFeatures));
                    console.log('Sending features to backend:', lastKeyFrameFeatures);
                    axios
                        .post('http://192.168.8.100:5001/predict', formData, {
                            headers: { 'Content-Type': 'multipart/form-data' },
                        })
                        .then((response) => {
                            console.log('Backend response:', response.data);
                            if (response.data.prediction) {
                                setPrediction(response.data.prediction);
                            }
                        })
                        .catch((error) => {
                            console.error('Error sending to server:', error.message);
                        });
                    lastSentTime = currentTime;
                    lastKeyFrameFeatures = null;
                }
            } else {
                setPrediction(null);
            }
        });

        let animationFrameId: number;
        const processFrame = async () => {
            if (videoElement.readyState >= 2) {
                await hands.send({ image: videoElement });
            }
            animationFrameId = requestAnimationFrame(processFrame);
        };

        videoElement.onloadedmetadata = () => {
            videoElement.play();
            animationFrameId = requestAnimationFrame(processFrame);
        };

        return () => {
            cancelAnimationFrame(animationFrameId);
            hands.close();
            setPrediction(null);
        };
    }, [videoElement, stream, isEnabled]);

    return { prediction };
};