import React from 'react';
import { motion } from 'framer-motion';
import { useAudioStore } from '../stores/audioStore';

interface MenuProps {
  onClose: () => void;
}

export function Menu({ onClose }: MenuProps) {
  const { isActiveMode, isAgentMode, toggleActiveMode, handleImageUpload, handleFileUpload, startAgentChat } = useAudioStore();

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = isAgentMode ? '.pdf,image/*' : 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      if (file.type.startsWith('image/')) {
        handleImageUpload(file);
      } else if (file.type === 'application/pdf' && isAgentMode) {
        handleFileUpload(file);
      }
      onClose();
    };
    input.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute bottom-full left-12 mb-2 w-64 bg-[#1a2733]/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden border border-gray-700/50"
    >
      <div className="p-1 flex flex-col">
        <motion.button
          whileHover={{ backgroundColor: '#2a3744' }}
          onClick={handleFileSelect}
          className="w-full flex items-center gap-3 px-4 py-3 text-white/90 rounded-lg transition-colors text-left text-sm"
        >
          {isAgentMode ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 8a2 2 0 11-4 0 2 2 0 014 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {isAgentMode ? 'Charger un fichier' : 'Charger une image'}
        </motion.button>

        <motion.button
          whileHover={{ backgroundColor: '#2a3744' }}
          onClick={() => {
            toggleActiveMode();
            onClose();
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left text-sm ${
            isActiveMode ? 'text-[#00c48c]' : 'text-white/90'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 18v-6a9 9 0 0118 0v6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Écoute active {isActiveMode ? '(activée)' : ''}
        </motion.button>

        {!isAgentMode && (
          <motion.button
            whileHover={{ backgroundColor: '#2a3744' }}
            onClick={() => {
              startAgentChat();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-white/90 rounded-lg transition-colors text-left text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Contacter un agent
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}