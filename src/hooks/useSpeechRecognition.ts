import { useEffect, useCallback } from 'react';
import { useAudioStore } from '../stores/audioStore';

export function useSpeechRecognition() {
  const { startListening, stopListening, sendMessage } = useAudioStore();

  const initSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'fr-FR';

    recognition.onstart = () => {
      startListening();
    };

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      if (result.trim()) {
        sendMessage(result);
      }
    };

    recognition.onend = () => {
      stopListening();
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      stopListening();
    };

    return recognition;
  }, [startListening, stopListening, sendMessage]);

  useEffect(() => {
    const recognition = initSpeechRecognition();
    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, [initSpeechRecognition]);

  return { initSpeechRecognition };
}