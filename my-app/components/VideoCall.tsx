'use client';

import { useSocket } from "@/context/SocketContext";
import VideoContainer from "./VideoContainer";
import { MdMic, MdMicOff, MdVideocam, MdVideocamOff } from "react-icons/md";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import ChatBox from './ChatBox';
import { Socket } from 'socket.io-client';
import useVoiceToText from "./hook/useVoicetoText";


interface Peer {
    stream?: MediaStream;
}

interface SenderMessage {
    senderId: string;
    message: string;
    timestamp: string;
}

interface SocketContextType {
    localStream: MediaStream | null;
    peer: Peer | null;
    isCallEnded: boolean;
    ongoingCall: boolean | null;
    handleHangup: (args: { ongoingCall?: boolean | null }) => void;
    sendMessage: (message: string) => void;
    messages: SenderMessage[];
    socket: Socket | null;
}

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
    } = useSocket() as SocketContextType;
    const { user } = useUser();
    const [isMicOn, setIsMicOn] = useState<boolean>(true);
    const [isVidOn, setIsVidOn] = useState<boolean>(true);
    const [prediction, setPrediction] = useState<string | null>(null);
    const [showPrediction, setShowPrediction] = useState<boolean>(false);
    const [messageInput, setMessageInput] = useState<string>("");
    const isOnCall: boolean = localStream && peer && ongoingCall ? true : false;

    // Integrate voice-to-text hook
    const { transcribedText, isListening, setIsListening } = useVoiceToText(localStream, isOnCall, isMicOn);

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

    useEffect(() => {
        if (showPrediction && prediction && ongoingCall && user?.id) {
            const senderMessage: SenderMessage = {
                senderId: user.id,
                message: prediction,
                timestamp: new Date().toISOString(),
            };
            socket?.emit("addSenderMessage", senderMessage);
            sendMessage(prediction);
        }
    }, [showPrediction, prediction, socket, sendMessage, ongoingCall, user?.id]);

    // Send transcribed text to chat when available
    useEffect(() => {
        if (transcribedText && ongoingCall && user?.id && isListening) {
            const senderMessage: SenderMessage = {
                senderId: user.id,
                message: transcribedText,
                timestamp: new Date().toISOString(),
            };
            socket?.emit("addSenderMessage", senderMessage);
            sendMessage(transcribedText);
        }
    }, [transcribedText, socket, sendMessage, ongoingCall, user?.id, isListening]);

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
            const senderMessage: SenderMessage = {
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
            const senderMessage: SenderMessage = {
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
                    <div className="relative max-w-[800px] mx-auto">
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
                        {isOnCall && (
                            <button
                                onClick={() => {
                                    setIsListening(!isListening);
                                    console.log('Listening toggled:', !isListening);
                                }}
                                className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                {isListening ? 'Stop Listening' : 'Say a Word'}
                            </button>
                        )}
                    </div>

                    {/* Display transcribed text */}
                    {transcribedText && isListening && (
                        <div className="mt-4 text-gray-800">
                            Transcribed Text: {transcribedText}
                        </div>
                    )}
                </div>

                <ChatBox
                    messages={messages}
                    showPrediction={showPrediction}
                    prediction={prediction}
                    messageInput={messageInput}
                    setMessageInput={setMessageInput}
                    handleSendMessage={handleSendMessage}
                    handleKeyPress={handleKeyPress}
                    ongoingCall={ongoingCall}
                />
            </div>
        </>
    );
};

export default VideoCall;