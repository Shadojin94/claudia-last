import React, { useRef, useEffect, useState } from 'react';
import { useAudioStore } from '../stores/audioStore';
import { motion, AnimatePresence } from 'framer-motion';

export function AIResponse() {
  const { aiResponse } = useAudioStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(40);

  useEffect(() => {
    if (contentRef.current) {
      const scrollHeight = contentRef.current.scrollHeight;
      setContentHeight(Math.max(40, Math.min(scrollHeight, 200)));
    }
  }, [aiResponse]);

  return (
    <AnimatePresence>
      <motion.div 
        className="text-center text-[#00c48c] overflow-y-auto scrollbar-thin scrollbar-thumb-[#00c48c]/50 scrollbar-track-transparent px-4 mx-auto max-w-[90%]"
        initial={{ height: 40 }}
        animate={{ height: contentHeight }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0, 196, 140, 0.5) transparent'
        }}
      >
        <div ref={contentRef} className="py-2">
          {aiResponse}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}