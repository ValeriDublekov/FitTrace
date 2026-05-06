import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700 shadow-red-100',
    warning: 'bg-amber-500 hover:bg-amber-600 shadow-amber-100',
    info: 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
  };

  const iconStyles = {
    danger: 'text-red-600 bg-red-50',
    warning: 'text-amber-500 bg-amber-50',
    info: 'text-blue-600 bg-blue-50'
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" id="confirm-modal-overlay">
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
          id="confirm-modal-content"
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${iconStyles[variant]}`}>
                <AlertCircle className="w-6 h-6" />
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
          
          <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row-reverse gap-3">
            <button
              onClick={() => {
                onConfirm();
                onCancel();
              }}
              className={`px-6 py-2.5 text-white font-semibold rounded-xl transition-all shadow-lg ${variantStyles[variant]}`}
              id="confirm-modal-action-btn"
            >
              {confirmLabel}
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-2.5 text-gray-600 font-semibold bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-all"
              id="confirm-modal-cancel-btn"
            >
              {cancelLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
