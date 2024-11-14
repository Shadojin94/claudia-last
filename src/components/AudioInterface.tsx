import React from 'react';
import { useAudioStore } from '../stores/audioStore';

export function AudioInterface() {
  const { isListening, isAISpeaking } = useAudioStore();
  
  return (
    <div className="relative flex flex-col items-center gap-5">
      <div 
        className={`w-[200px] h-[200px] border-3 rounded-full flex items-center justify-center relative cursor-pointer transition-colors duration-300 ${
          isListening ? 'border-red-500' : 'border-[#00c48c]'
        }`}
      >
        <canvas id="spectre" className="absolute w-full h-full rounded-full" />
        <div className="absolute text-center text-sm max-w-[80%] pointer-events-none">
          {isListening ? "Je vous écoute..." : "Appuyez ici pour parler"}
        </div>
      </div>
      <div className="text-center min-h-[20px] text-[#00c48c]" id="aiResponse" />
      <div className="font-mono text-sm text-gray-500" id="timer">00:00</div>
    </div>
  );
}