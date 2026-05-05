import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const InstallPrompt: React.FC = () => {
  const { isInstallable, handleInstallClick } = usePWAInstall();
  const [dismissed, setDismissed] = React.useState(false);

  // We only show this on mobile/android-like behavior where isInstallable is true
  if (!isInstallable || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 z-50 md:bottom-6 md:left-auto md:right-6 md:w-80"
      >
        <div className="bg-zinc-900 text-white p-4 rounded-xl shadow-2xl flex items-center justify-between border border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="bg-zinc-800 p-2 rounded-lg">
              <Download className="w-5 h-5 text-zinc-100" />
            </div>
            <div>
              <p className="text-sm font-medium">Install FitTrace</p>
              <p className="text-xs text-zinc-400">Add to your home screen</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="bg-white text-zinc-900 text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-zinc-200 transition-colors"
            >
              Install
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-zinc-500 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
