import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Exercise } from '../../../types';
import { Plus, Edit3, Trash2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExerciseCardProps {
  exercise: Exercise;
  onAdd: (exercise: Exercise) => void;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exercise: Exercise) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onAdd, onEdit, onDelete }) => {
  const [isEnlarged, setIsEnlarged] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex items-center p-4 gap-4 transition-all hover:shadow-md hover:border-indigo-100 group"
    >
      <div 
        className="w-14 h-14 flex-shrink-0 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-100 group-hover:border-indigo-100 transition-colors cursor-pointer"
        onClick={(e) => {
          if (exercise.thumbnailUrl) {
            e.stopPropagation();
            setIsEnlarged(true);
          }
        }}
      >
        {exercise.thumbnailUrl ? (
          <img 
            src={exercise.thumbnailUrl} 
            alt={exercise.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="text-slate-400 text-[10px] font-medium text-center p-1 uppercase tracking-tight">No Image</div>
        )}
      </div>

      {createPortal(
        <AnimatePresence>
          {isEnlarged && exercise.thumbnailUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsEnlarged(false);
              }}
              className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-4 cursor-pointer"
            >
              <motion.img 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                src={exercise.thumbnailUrl} 
                alt={exercise.name} 
                className="max-w-full max-h-full rounded-lg shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-slate-900 truncate tracking-tight">{exercise.name}</h3>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em]">{exercise.category}</p>
          {exercise.isCustom && (
            <span className="text-[10px] bg-amber-50 text-amber-600 font-black px-1.5 py-0.5 rounded uppercase tracking-[0.1em]">Custom</span>
          )}
          {exercise.url && (
            <a 
              href={exercise.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-500 hover:text-indigo-700 p-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {exercise.isCustom && (
          <>
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(exercise);
                }}
                className="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full hover:bg-slate-200 hover:text-slate-600 transition-all"
              >
                <Edit3 size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(exercise);
                }}
                className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-400 rounded-full hover:bg-red-600 hover:text-white transition-all"
              >
                <Trash2 size={16} />
              </button>
            )}
          </>
        )}
        <button
          id={`add-exercise-${exercise.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onAdd(exercise);
          }}
          className="w-11 h-11 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-600 hover:text-white active:scale-90 transition-all shadow-sm"
          aria-label={`Add ${exercise.name}`}
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>
      </div>
    </motion.div>
  );
};
