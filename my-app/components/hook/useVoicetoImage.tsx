'use client';

import { useEffect, useState, useRef } from 'react';

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
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

declare global {
    interface Window {
        SpeechRecognition: { new(): SpeechRecognition };
        webkitSpeechRecognition: { new(): SpeechRecognition };
    }
}

export const useVoiceToImage = (stream: MediaStream | null, isOnCall: boolean, isMicOn: boolean) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
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
                    fetchImageFromServer(combinedWords.current.join(' '));
                }
            } else {
                const currentWord = words[words.length - 1];
                if (currentWord) {
                    combinedWords.current = [currentWord];
                    fetchImageFromServer(currentWord);
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

    const fetchImageFromServer = (newPhrase: string) => {
        const imageUrl = `http://192.168.8.100:5001/images/${encodeURIComponent(newPhrase)}.png`;
        console.log('Setting image URL:', imageUrl);
        setImageUrl(imageUrl);
    };

    return { imageUrl, isListening, setIsListening };
};