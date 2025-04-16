'use client';

import { useSocket } from "@/context/SocketContext";
import VideoContainer from "./VideoContainer";
import { MdMic, MdMicOff, MdVideocam, MdVideocamOff } from "react-icons/md";
import { useState, useEffect, useRef } from "react";
import PredictionDisplay from './PredictionDisplay';
import { useUser } from "@clerk/nextjs";

const VideoCall = () => {
    const {
        localStream,
        peer,
        isCallEnded,
        ongoingCall,
        handleHangup,
        sendMessage,
        messages,
        socket,
    } = useSocket();
    const { user } = useUser();
    const [isMicOn, setIsMicOn] = useState(true);
    const [isVidOn, setIsVidOn] = useState(true);
    const [prediction, setPrediction] = useState<string | null>(null);
    const [showPrediction, setShowPrediction] = useState(false);
    const [messageInput, setMessageInput] = useState("");
    const chatRef = useRef<HTMLDivElement>(null);
    const isOnCall = localStream && peer && ongoingCall ? true : false;

    // Handle socket message errors
    useEffect(() => {
        if (!socket) return;

        const handleMessageError = (error: { error: string }) => {
            alert(`Error: ${error.error}`);
        };

        socket.on("messageErrorToUI", handleMessageError);
        return () => {
            socket.off("messageErrorToUI", handleMessageError);
        };
    }, [socket]);

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    // Automatically send prediction as a message
    useEffect(() => {
        if (showPrediction && prediction && ongoingCall && user?.id) {
            const senderMessage = {
                senderId: user.id,
                message: prediction,
                timestamp: new Date().toISOString(),
            };
            socket?.emit("addSenderMessage", senderMessage);
            sendMessage(prediction);
        }
    }, [showPrediction, prediction, socket, sendMessage, ongoingCall, user?.id]);

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

    const togglePredictionDisplay = () => {
        setShowPrediction(!showPrediction);
    };

    const handleSendMessage = () => {
        if (messageInput.trim() && ongoingCall && user?.id) {
            console.log("Sending message:", messageInput);
            const senderMessage = {
                senderId: user.id,
                message: messageInput,
                timestamp: new Date().toISOString(),
            };
            socket?.emit("addSenderMessage", senderMessage);
            sendMessage(messageInput);
            setMessageInput("");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && messageInput.trim() && ongoingCall && user?.id) {
            console.log("Sending message via Enter:", messageInput);
            const senderMessage = {
                senderId: user.id,
                message: messageInput,
                timestamp: new Date().toISOString(),
            };
            socket?.emit("addSenderMessage", senderMessage);
            sendMessage(messageInput);
            setMessageInput("");
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
                        <button onClick={toggleAudio}>
                            {!isMicOn ? <MdMic size={28} /> : <MdMicOff size={28} />}
                        </button>
                        <button
                            className="px-4 py-2 bg-rose-500 text-white rounded mx-4"
                            onClick={() => handleHangup({ ongoingCall: ongoingCall ? ongoingCall : undefined })}
                        >
                            End Call
                        </button>
                        <button onClick={toggleCamera}>
                            {!isVidOn ? <MdVideocam size={28} /> : <MdVideocamOff size={28} />}
                        </button>
                        <button
                            className="px-4 py-2 bg-blue-500 text-white rounded mx-4"
                            onClick={togglePredictionDisplay}
                        >
                            {showPrediction ? 'Hide SLT Model' : 'Use SLT Model'}
                        </button>
                    </div>
                </div>

                {/* CHAT BOX */}
                <div className="mr-10 ml-10 flex flex-col border-4 border-slate-400 w-[350px] h-[500px] rounded-lg overflow-hidden">
                    <div className="bg-slate-400 text-white font-semibold text-center py-2">
                        AI Assistant
                    </div>

                    <div ref={chatRef} className="flex-1 flex flex-col gap-2 px-4 py-2 overflow-y-auto bg-white">
                        {showPrediction && <PredictionDisplay prediction={prediction} />}
                        {messages.map((msg, idx) => (
                            <div key={`${msg.senderId}-${msg.timestamp}-${idx}`} className={`p-2 rounded-md max-w-[80%] ${msg.senderId === user?.id ? 'bg-blue-200 self-end text-blue-900' : 'bg-gray-200 self-start text-gray-900'}`} >
                                <div className="text-gray-600">
                                    <h1 className="text-lg font-medium">{msg.message}</h1>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-2 border-t border-slate-300 flex gap-2">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 p-2 border rounded-md"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={!ongoingCall}
                        />
                        <button
                            className="bg-blue-500 text-white px-3 py-2 rounded-md"
                            onClick={handleSendMessage}
                            disabled={!ongoingCall || !messageInput.trim()}
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VideoCall;