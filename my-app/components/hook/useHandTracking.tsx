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
        if (prediction) {
            console.log("Prediction received in VideoCall:", prediction);
        }
    }, [prediction]);

    useEffect(() => {
        if (!videoElement || !stream || !isEnabled) {
            setPrediction(null);
            return;
        }

        const hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
        });
        console.log("useHandTracking: Hands initialized");

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
            try {
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
                        if (movement > 0.0001) {
                            lastKeyFrameFeatures = features;
                        }
                    }
                    previousLandmarks = features;
                    const currentTime = Date.now();

                    if (lastKeyFrameFeatures && currentTime - lastSentTime >= 1000) {
                        const formData = new FormData();
                        formData.append('features', JSON.stringify(lastKeyFrameFeatures));
                        axios
                            .post('http://127.0.0.1:5001/predict', formData, {
                                headers: { 'Content-Type': 'multipart/form-data' },
                            })
                            .then((response) => {
                                console.log("useHandTracking: Response", { data: response.data });
                                if (response.data.prediction) {
                                    setPrediction(response.data.prediction);
                                }
                            })
                            .catch((error) => {
                                console.error("useHandTracking: Request error", { error: error.message });
                            });
                        lastSentTime = currentTime;
                        lastKeyFrameFeatures = null;
                    }
                } else {
                    setPrediction(null);
                }
            } catch (error) {
                console.error("useHandTracking: Error in onResults", { error });
            }
        });

        let animationFrameId: number;
        const processFrame = async () => {
            try {
                if (videoElement.readyState >= 2) {
                    await hands.send({ image: videoElement });
                }
                animationFrameId = requestAnimationFrame(processFrame);
            } catch (error) {
                console.error("useHandTracking: Error processing frame", { error });
            }
        };

        videoElement.onloadedmetadata = () => {
            videoElement.play().catch((error) => {
                console.error("useHandTracking: Video play error", { error });
            });
            animationFrameId = requestAnimationFrame(processFrame);
        };

        return () => {
            console.log("useHandTracking: Cleanup");
            cancelAnimationFrame(animationFrameId);
            hands.close().catch((error) => {
                console.error("useHandTracking: Hands close error", { error });
            });
            setPrediction(null);
        };
    }, [videoElement, stream, isEnabled]);

    return { prediction };
};