import React from 'react';
import { useAudioStore } from '../stores/audioStore';

export function DownloadModal() {
  const { showDownloadModal, toggleDownloadModal } = useAudioStore();

  const handleDownload = () => {
    // Implement download logic here
    toggleDownloadModal();
  };

  if (!showDownloadModal) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#1a2733] p-5 rounded-lg text-center">
        <p>Voulez-vous télécharger le contexte de la conversation ?</p>
        <div className="flex justify-center gap-3 mt-5">
          <button
            onClick={handleDownload}
            className="px-5 py-2 bg-[#00c48c] text-[#0a0e14] font-bold rounded"
          >
            Oui
          </button>
          <button
            onClick={toggleDownloadModal}
            className="px-5 py-2 bg-[#ff4136] text-white font-bold rounded"
          >
            Non
          </button>
        </div>
      </div>
    </div>
  );
}