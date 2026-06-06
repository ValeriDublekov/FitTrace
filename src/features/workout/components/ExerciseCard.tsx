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
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setIsDetailOpen(true)}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex items-center p-4 gap-4 transition-all hover:shadow-md hover:border-indigo-100 group cursor-pointer"
    >
      <div 
        className="w-14 h-14 flex-shrink-0 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-100 group-hover:border-indigo-100 transition-colors"
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
          {isDetailOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsDetailOpen(false);
              }}
              className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 cursor-pointer"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl cursor-default space-y-4"
              >
                {exercise.thumbnailUrl && (
                  <img 
                    src={exercise.thumbnailUrl} 
                    alt={exercise.name} 
                    className="w-full h-64 object-cover rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {exercise.name} {exercise.affectedPart ? `(${exercise.affectedPart})` : ''}
                  </h3>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.1em]">{exercise.category}</p>
                </div>
                {exercise.defaultNotes && (
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl">{exercise.defaultNotes}</p>
                )}
                {exercise.description && (
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 space-y-1">
                    <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest block">AI Техника и съвети</span>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{exercise.description}</p>
                  </div>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdd(exercise);
                    setIsDetailOpen(false);
                  }}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Стартирай упражнението
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <div className="flex-1 min-w-0 pointer-events-none">
        <h3 className="font-bold text-slate-900 leading-tight tracking-tight break-words">
          {exercise.name} {exercise.affectedPart ? `(${exercise.affectedPart})` : ''}
        </h3>
        <div className="flex items-center gap-2 mt-1 [.font-size-large_&]:hidden [.font-size-xlarge_&]:hidden">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em]">{exercise.category}</p>
          {exercise.loadType && (
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              • {exercise.loadType.replace('_', ' ')}
            </span>
          )}
          {exercise.isCustom && (
            <span className="text-[10px] bg-amber-50 text-amber-600 font-black px-1.5 py-0.5 rounded uppercase tracking-[0.1em]">Custom</span>
          )}
          {exercise.url && (
            <a 
              href={exercise.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-500 hover:text-indigo-700 p-0.5 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pointer-events-auto">
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
