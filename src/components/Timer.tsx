import React, { useEffect, useState } from 'react';
import { useAudioStore } from '../stores/audioStore';

export function Timer() {
  const { sessionStartTime, isListening, isAISpeaking } = useAudioStore();
  const [time, setTime] = useState('00:00');

  useEffect(() => {
    if (!sessionStartTime) return;

    const updateTimer = () => {
      const elapsed = Date.now() - sessionStartTime;
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      setTime(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };

    if (isListening || isAISpeaking) {
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [sessionStartTime, isListening, isAISpeaking]);

  return (
    <div className="font-mono text-sm text-gray-500">
      {time}
    </div>
  );
}