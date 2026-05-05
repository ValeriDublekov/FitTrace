import React from 'react';
import { motion } from 'motion/react';

interface WorkoutLayoutProps {
  children: React.ReactNode;
  title: string;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export const WorkoutLayout: React.FC<WorkoutLayoutProps> = ({ children, title, onBack, actions }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-16 font-sans">
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-900 active:scale-95 transition-transform"
              aria-label="Go back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          )}
          <h1 className="font-bold text-xl text-slate-900 tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {actions}
        </div>
      </header>

      <main className="flex-1 p-4 pb-20 max-w-lg mx-auto w-full">
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};
