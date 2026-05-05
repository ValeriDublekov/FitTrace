import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, X } from 'lucide-react';

interface RestTimerProps {
  seconds: number | null;
  onClear: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({ seconds, onClear }) => {
  if (seconds === null) return null;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[200px]"
      >
        <div className="bg-indigo-600 text-white rounded-full p-1.5 shadow-xl flex items-center gap-3 border border-indigo-500/50 backdrop-blur-sm">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
            <Timer size={20} className="text-white" />
          </div>
          
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-100/70 leading-none">Rest Time</span>
            <span className="text-xl font-black tabular-nums tracking-tight leading-tight">
              {minutes}:{remainingSeconds.toString().padStart(2, '0')}
            </span>
          </div>

          <button 
            onClick={onClear}
            className="ml-auto w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
