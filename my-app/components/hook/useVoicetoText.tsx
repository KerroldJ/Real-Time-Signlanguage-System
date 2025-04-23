'use client';

import { useState, useEffect, useRef } from "react";

// Speech Recognition interfaces
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    length: number;
}

interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative;
    length: number;
    isFinal: boolean;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
}

// Declare global types for SpeechRecognition
declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

// Custom hook for voice-to-text
const useVoiceToText = (stream: MediaStream | null, isOnCall: boolean, isMicOn: boolean) => {
    const [transcribedText, setTranscribedText] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const isListeningRef = useRef(isListening);
    const combinedWords = useRef<string[]>([]);

    useEffect(() => {
        isListeningRef.current = isListening;
        if (!stream || !isOnCall || !isMicOn || !isListening) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.error('Speech Recognition API not supported in this browser');
            return;
        }
        const recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length === 0 || !audioTracks[0].enabled) {
            console.warn('No active audio track in stream');
            return;
        }

        recognition.onstart = () => {
            console.log('Speech recognition started');
            combinedWords.current = [];
        };

        recognition.onresult = (event) => {
            const result = event.results[event.results.length - 1];
            const transcript = result[0].transcript.trim().toLowerCase();
            const words = transcript.split(' ').filter(word => word.length > 0);

            if (words.length === 0) return;
            if (transcript.includes('add the word')) {
                const lastWord = words[words.length - 2];
                if (lastWord) {
                    combinedWords.current.push(lastWord);
                    setTranscribedText(combinedWords.current.join(' '));
                }
            } else {
                const currentWord = words[words.length - 1];
                if (currentWord) {
                    combinedWords.current = [currentWord];
                    setTranscribedText(currentWord);
                }
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };

        recognition.onend = () => {
            console.log('Speech recognition ended');
            if (isListeningRef.current && isOnCall && isMicOn) {
                console.log('Restarting recognition');
                try {
                    recognition.start();
                } catch (error) {
                    console.error('Failed to restart recognition:', error);
                }
            } else {
                console.log('Not restarting recognition:', { isListening: isListeningRef.current, isOnCall, isMicOn });
            }
        };

        console.log('Starting recognition');
        try {
            recognition.start();
        } catch (error) {
            console.error('Failed to start recognition:', error);
        }

        return () => {
            console.log('Cleaning up recognition');
            recognition.stop();
        };
    }, [stream, isOnCall, isMicOn, isListening]);

    return { transcribedText, isListening, setIsListening };
};

export default useVoiceToText;