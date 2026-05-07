import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, X } from 'lucide-react';

interface ActionPromptModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  yesLabel?: string;
  noLabel?: string;
  cancelLabel?: string;
  onYes: () => void;
  onNo: () => void;
  onCancel: () => void;
}

export const ActionPromptModal: React.FC<ActionPromptModalProps> = ({
  isOpen,
  title,
  message,
  yesLabel = 'Yes',
  noLabel = 'No',
  cancelLabel = 'Cancel',
  onYes,
  onNo,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                <HelpCircle className="w-6 h-6" />
              </div>
              <button 
                onClick={onCancel}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 leading-relaxed">{message}</p>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 flex flex-col gap-3">
            <button
              onClick={() => {
                onYes();
              }}
              className="w-full px-6 py-3 text-white font-bold bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-lg"
            >
              {yesLabel}
            </button>
            <button
              onClick={() => {
                onNo();
              }}
              className="w-full px-6 py-3 text-red-600 font-bold bg-red-50 hover:bg-red-100 rounded-xl transition-all"
            >
              {noLabel}
            </button>
            <button
              onClick={onCancel}
              className="w-full px-6 py-3 text-gray-600 font-bold bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-all"
            >
              {cancelLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
