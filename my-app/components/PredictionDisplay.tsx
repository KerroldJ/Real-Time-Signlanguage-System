'use client';

import React from 'react';

interface PredictionDisplayProps {
    prediction: string | null;
}

const PredictionDisplay: React.FC<PredictionDisplayProps> = ({ prediction }) => {
    const speakPrediction = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const firstWord = text.split(' right_hand')[0];

            const utterance = new SpeechSynthesisUtterance(firstWord);
            utterance.volume = 1;
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event.error);
            };

            window.speechSynthesis.speak(utterance);
        } else {
            console.log('Browser does not support speech synthesis');
        }
    };
    React.useEffect(() => {
        if (prediction) {
            const timer = setTimeout(() => {
                speakPrediction(prediction);
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [prediction]);

    return (
        <div className="flex flex-col items-center">
            {prediction && (
                <div className="mt-4 p-3 border-2 border-slate-400 rounded-lg font-bold">
                    Prediction: {prediction}
                </div>
            )}
        </div>
    );
};

export default PredictionDisplay;