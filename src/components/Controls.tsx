import React, { useState } from 'react';
import { useAudioStore } from '../stores/audioStore';
import { Menu } from './Menu';
import { motion, AnimatePresence } from 'framer-motion';

export function Controls() {
  const { isActiveMode, isAgentMode, sendMessage, sendMessageToAgent } = useAudioStore();
  const [message, setMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      if (isAgentMode) {
        await sendMessageToAgent(message);
      } else {
        await sendMessage(message);
      }
      setMessage('');
    }
  };

  return (
    <div className="relative mt-2">
      <AnimatePresence>
        {showMenu && <Menu onClose={() => setShowMenu(false)} />}
      </AnimatePresence>
      
      <motion.form 
        onSubmit={handleSubmit}
        initial={{ width: '250px' }}
        animate={{ width: isFocused ? '100%' : '250px' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex items-center gap-3 bg-[#1a2733] rounded-full p-2 border border-gray-700 mx-auto"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm">C</span>
        </div>

        <button
          type="button"
          onClick={() => setShowMenu(!showMenu)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#00c48c] hover:bg-[#1f2937] transition-colors flex-shrink-0"
        >
          <motion.svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor"
            animate={{ rotate: showMenu ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </motion.svg>
        </button>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isAgentMode ? "Message à l'agent" : "Message Claudia"}
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400 text-sm min-w-0 px-3 truncate"
        />
      </motion.form>
    </div>
  );
}