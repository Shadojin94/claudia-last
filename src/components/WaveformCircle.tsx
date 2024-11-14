import React, { useCallback, useRef } from 'react';
import { useAudioStore } from '../stores/audioStore';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

export function WaveformCircle() {
  const { isListening, isAISpeaking } = useAudioStore();
  const { initSpeechRecognition } = useSpeechRecognition();
  const recognitionRef = useRef<any>(null);

  const handleClick = useCallback(() => {
    if (isAISpeaking) {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      return;
    }

    if (!isListening) {
      recognitionRef.current = initSpeechRecognition();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error('Error starting recognition:', error);
        }
      }
    } else if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, [isListening, isAISpeaking, initSpeechRecognition]);

  return (
    <div 
      onClick={handleClick}
      className={`w-[200px] h-[200px] border-3 rounded-full flex items-center justify-center relative cursor-pointer transition-colors duration-300 overflow-hidden ${
        isListening ? 'border-red-500' : 'border-[#00c48c]'
      }`}
    >
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://claudia.zetamind.com/57c3095522012bd961e7dee3e0818c67.gif)',
          backgroundSize: '180%',
          backgroundPosition: '-80px center'
        }}
      />
      <div className="absolute text-center text-sm max-w-[80%] pointer-events-none z-10 bg-black/30 px-3 py-1 rounded-full">
        {isListening ? "Je vous écoute..." : "Appuyez ici pour parler"}
      </div>
    </div>
  );
}