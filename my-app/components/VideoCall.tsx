'use client';

import { useSocket } from "@/context/SocketContext";
import VideoContainer from "./VideoContainer";
import { MdMic, MdMicOff, MdVideocam, MdVideocamOff } from "react-icons/md";
import { useState } from "react";
import PredictionDisplay from './PredictionDisplay';

const VideoCall = () => {
    const { localStream, peer, isCallEnded, ongoingCall, handleHangup } = useSocket();
    const [isMicOn, setIsMicOn] = useState(true);
    const [isVidOn, setIsVidOn] = useState(true);
    const [prediction, setPrediction] = useState<string | null>(null);
    const isOnCall = localStream && peer && ongoingCall ? true : false;


    if (isCallEnded) {
        return <div className="mt-5 text-rose-500">Call Ended</div>;
    }

    if (!localStream && !peer) return null;

    const toggleCamera = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
            setIsVidOn(videoTrack.enabled);
        }
    };

    const toggleAudio = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            setIsMicOn(audioTrack.enabled);
        }
    };

    return (
        <>
            <div className="mt-8 flex flex-row justify-between">
                <div className="ml-10 flex flex-col items-center">
                    <div className="relative">
                        {localStream && (
                            <VideoContainer
                                stream={localStream}
                                isLocalStream={true}
                                isOnCall={isOnCall}
                                onPrediction={setPrediction}
                            />
                        )}

                        {peer && peer.stream && (
                            <VideoContainer
                                stream={peer.stream}
                                isLocalStream={false}
                                isOnCall={isOnCall}
                            />
                        )}
                    </div>

                    <div className="mt-8 flex items-center">
                        <button onClick={toggleAudio}> {!isMicOn ? <MdMic size={28} /> : <MdMicOff size={28} />} </button>
                        <button className="px-4 py-2 bg-rose-500 text-white rounded mx-4" onClick={() => handleHangup({ ongoingCall: ongoingCall ? ongoingCall : undefined })} >
                            End Call
                        </button>
                        <button onClick={toggleCamera}> {!isVidOn ? <MdVideocam size={28} /> : <MdVideocamOff size={28} />}</button>
                    </div>
                </div>

                {/* CHAT BOX */}
                <div className="mr-10 ml-10 flex flex-col border-4 border-slate-400 w-[350px] h-[500px] rounded-lg overflow-hidden">
                    <div className="bg-slate-400 text-white font-semibold text-center py-2">
                        AI Assistant
                    </div>
                    <div className="flex-1 flex flex-col gap-2 px-4 py-2 overflow-y-auto bg-white">
                        <PredictionDisplay prediction={prediction} />
                    </div>         
                        <div className="p-2 border-t border-slate-300 flex gap-2">
                            <input
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 p-2 border rounded-md"
                            />
                            <button className="bg-blue-500 text-white px-3 py-2 rounded-md">Send</button>
                        </div>
                </div>
            </div>
        </>
    );
};

export default VideoCall;
