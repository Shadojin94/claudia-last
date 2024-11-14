import React from 'react';
import { Header } from './components/Header';
import { DateTime } from './components/DateTime';
import { WaveformCircle } from './components/WaveformCircle';
import { AIResponse } from './components/AIResponse';
import { Timer } from './components/Timer';
import { Controls } from './components/Controls';
import { DownloadModal } from './components/DownloadModal';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0e14] text-white flex justify-center items-center">
      <div className="w-full max-w-[500px] p-5 flex flex-col gap-5">
        <Header />
        <DateTime />
        <div className="flex flex-col items-center gap-5">
          <WaveformCircle />
          <AIResponse />
          <Timer />
        </div>
        <Controls />
      </div>
      <DownloadModal />
    </div>
  );
}