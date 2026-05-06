import React from 'react';
import { ExerciseSet, LoadType } from '../../../types';
import { useWorkoutContext } from '../context/WorkoutSessionContext';
import { Check, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface SetLoggerProps {
  set: ExerciseSet;
  exerciseId: string;
  loadType: LoadType;
}

export const SetLogger: React.FC<SetLoggerProps> = ({ set, exerciseId, loadType }) => {
  const { updateSet, removeSet, sessionMode } = useWorkoutContext();
  const isCompleted = set.isCompleted;
  
  // In manual mode, we allow editing even if "completed"
  const canEdit = sessionMode === 'MANUAL' || !isCompleted;

  const onUpdate = (data: Partial<ExerciseSet>) => {
    updateSet(exerciseId, set.setIndex, data);
  };

  const onRemove = () => {
    removeSet(exerciseId, set.setIndex);
  };

  return (
    <motion.div 
      layout
      className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
        isCompleted && sessionMode === 'LIVE' 
          ? 'bg-indigo-50/50 border-transparent' 
          : 'bg-white border border-slate-100 shadow-sm'
      }`}
    >
      <div className="w-8 flex-shrink-0 text-center font-black text-slate-400 text-xs tracking-tighter">
        #{set.setIndex}
      </div>

      <div className="flex-1 grid grid-cols-2 gap-2">
        {loadType === 'WEIGHT_REPS' && (
          <>
            <div className="relative">
              <input
                type="number"
                placeholder="0"
                value={set.weight || ''}
                disabled={!canEdit}
                onChange={(e) => onUpdate({ weight: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border-0 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all text-center"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase">Kg</span>
            </div>
            <div className="relative">
              <input
                type="number"
                placeholder="0"
                value={set.reps || ''}
                disabled={!canEdit}
                onChange={(e) => onUpdate({ reps: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border-0 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all text-center"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase">Reps</span>
            </div>
          </>
        )}

        {loadType === 'LEVEL_REPS' && (
          <>
            <div className="relative">
              <input
                type="number"
                placeholder="0"
                value={set.level || ''}
                disabled={!canEdit}
                onChange={(e) => onUpdate({ level: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border-0 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all text-center"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase">Lvl</span>
            </div>
            <div className="relative">
              <input
                type="number"
                placeholder="0"
                value={set.reps || ''}
                disabled={!canEdit}
                onChange={(e) => onUpdate({ reps: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border-0 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all text-center"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase">Reps</span>
            </div>
          </>
        )}

        {loadType === 'CARDIO' && (
          <>
            <div className="relative">
              <input
                type="number"
                placeholder="0"
                value={set.level || ''}
                disabled={!canEdit}
                onChange={(e) => onUpdate({ level: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border-0 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all text-center"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase">Diff</span>
            </div>
            <div className="relative">
              <input
                type="number"
                placeholder="0"
                value={set.duration || ''}
                disabled={!canEdit}
                onChange={(e) => onUpdate({ duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border-0 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all text-center"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase">Min</span>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-1 pl-1">
        {sessionMode === 'LIVE' ? (
          !isCompleted ? (
            <button
              onClick={() => onUpdate({ isCompleted: true })}
              className="w-9 h-9 flex items-center justify-center bg-indigo-600 text-white rounded-lg hover:bg-black active:scale-90 transition-all shadow-sm"
              title="Confirm Set"
            >
              <Check size={18} strokeWidth={3} />
            </button>
          ) : (
            <button
              onClick={() => onRemove()}
              className="w-9 h-9 flex items-center justify-center bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-200 active:scale-95 transition-all"
              title="Remove Set"
            >
              <Trash2 size={16} />
            </button>
          )
        ) : (
          <button
            onClick={() => onRemove()}
            className="w-9 h-9 flex items-center justify-center bg-slate-100 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-500 active:scale-95 transition-all"
            title="Remove Set"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </motion.div>
  );
};
