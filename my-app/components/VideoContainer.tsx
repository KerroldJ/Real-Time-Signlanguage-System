'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { useHandTracking } from '@/components/hook/useHandTracking';

interface VideoContainerProps {
    stream: MediaStream | null;
    isLocalStream: boolean;
    isOnCall: boolean;
    onPrediction?: (prediction: string | null) => void;
}

const VideoContainer: React.FC<VideoContainerProps> = ({
    stream,
    isLocalStream,
    isOnCall,
    onPrediction,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [trackingEnabled, setTrackingEnabled] = useState(false);

    useEffect(() => {
        if (videoRef.current && stream && isLocalStream) {
            setTrackingEnabled(true);
        }
    }, [videoRef.current, stream, isLocalStream]);

    const { prediction } = useHandTracking(videoRef.current, stream, trackingEnabled);

    useEffect(() => {
        if (isOnCall && prediction && onPrediction) {
            onPrediction(prediction);
        }
    }, [prediction, isOnCall, onPrediction]);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="flex flex-col">
            <video
                className={cn(
                    'rounded border w-[800px]',
                    isLocalStream && isOnCall && 'w-[200px] h-auto absolute border-purple-500 border-2'
                )}
                ref={videoRef}
                autoPlay
                playsInline
                muted={isLocalStream}
            />
        </div>
    );
};

export default VideoContainer;
