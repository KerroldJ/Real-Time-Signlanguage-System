'use client';

import React from 'react';

interface PredictionDisplayProps {
    prediction: string | null;
}

const PredictionDisplay: React.FC<PredictionDisplayProps> = ({ prediction }) => {
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
