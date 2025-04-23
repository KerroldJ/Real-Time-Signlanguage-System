'use client';

import { useRef, useEffect } from 'react';
import PredictionDisplay from './PredictionDisplay';
import { useUser } from '@clerk/nextjs';

interface ChatBoxProps {
    messages: { senderId: string; message: string; timestamp: string }[];
    showPrediction: boolean;
    prediction: string | null;
    messageInput: string;
    setMessageInput: (value: string) => void;
    handleSendMessage: () => void;
    handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    ongoingCall: boolean | null;
}

const ChatBox = ({
    messages,
    showPrediction,
    prediction,
    messageInput,
    setMessageInput,
    handleSendMessage,
    handleKeyPress,
    ongoingCall,
}: ChatBoxProps) => {
    const { user } = useUser();
    const chatRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (messages.length > 0) {
            const latestMessage = messages[messages.length - 1];
            if (latestMessage.senderId !== user?.id) {
                const utterance = new SpeechSynthesisUtterance(latestMessage.message);
                utterance.lang = 'en-US';
                utterance.volume = 1.0;
                utterance.rate = 1.0;
                utterance.pitch = 1.0;
                window.speechSynthesis.speak(utterance);
            }
        }
    }, [messages, user?.id]);

    return (
        <div className="mr-10 ml-10 flex flex-col border-4 border-slate-400 w-[350px] h-[500px] rounded-lg overflow-hidden">
            <div className="bg-slate-400 text-white font-semibold text-center py-2">
                AI Assistant
            </div>

            <div ref={chatRef} className="flex-1 flex flex-col gap-2 px-4 py-2 overflow-y-auto bg-white">
                {showPrediction && <PredictionDisplay prediction={prediction} />}
                {messages.map((msg, idx) => (
                    <div
                        key={`${msg.senderId}-${msg.timestamp}-${idx}`}
                        className={`p-2 rounded-md max-w-[80%] ${msg.senderId === user?.id ? 'bg-blue-200 self-end text-blue-900' : 'bg-gray-200 self-start text-gray-900'
                            }`}
                    >
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
    );
};

export default ChatBox;