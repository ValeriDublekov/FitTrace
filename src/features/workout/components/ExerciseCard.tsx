import React from 'react';
import { Exercise } from '../../../types';
import { Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface ExerciseCardProps {
  exercise: Exercise;
  onAdd: (exercise: Exercise) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onAdd }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex items-center p-4 gap-4 transition-all hover:shadow-md hover:border-indigo-100 group"
    >
      <div className="w-14 h-14 flex-shrink-0 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-100 group-hover:border-indigo-100 transition-colors">
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

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-slate-900 truncate tracking-tight">{exercise.name}</h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em] mt-0.5">{exercise.category}</p>
      </div>

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
    </motion.div>
  );
};
