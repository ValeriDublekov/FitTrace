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

      <div className="flex-1">
        <div className="grid grid-cols-2 gap-2">
          {loadType === 'WEIGHT_REPS' && (
            <>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0"
                  value={set.weight || ''}
                  disabled={!canEdit}
                  onChange={(e) => onUpdate({ weight: parseFloat(e.target.value) })}
                  className="w-full px-3 py-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-2xl font-black text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all text-center"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase pointer-events-none">Kg</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0"
                  value={set.reps || ''}
                  disabled={!canEdit}
                  onChange={(e) => onUpdate({ reps: parseInt(e.target.value) })}
                  className="w-full px-3 py-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-2xl font-black text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all text-center"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase pointer-events-none">Reps</span>
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
                  className="w-full px-3 py-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-2xl font-black text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all text-center"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase pointer-events-none">Lvl</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0"
                  value={set.reps || ''}
                  disabled={!canEdit}
                  onChange={(e) => onUpdate({ reps: parseInt(e.target.value) })}
                  className="w-full px-3 py-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-2xl font-black text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all text-center"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase pointer-events-none">Reps</span>
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
                  className="w-full px-3 py-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-2xl font-black text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all text-center"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase pointer-events-none">Diff</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0"
                  value={set.duration || ''}
                  disabled={!canEdit}
                  onChange={(e) => onUpdate({ duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-2xl font-black text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all text-center"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase pointer-events-none">Min</span>
              </div>
            </>
          )}
        </div>

        {loadType === 'WEIGHT_REPS' && canEdit && (
          <div className="grid grid-cols-3 gap-2 mt-4 px-0.5">
            {[-5, -2.5, -1, 1, 2.5, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onUpdate({ weight: Math.max(0, (set.weight || 0) + value) })}
                className={`flex items-center justify-center py-5 rounded-2xl border-2 transition-all select-none shadow-md active:scale-95 ${
                  value > 0 
                    ? 'bg-indigo-50 border-indigo-100 text-indigo-700 text-2xl font-black' 
                    : 'bg-slate-100 border-slate-200 text-slate-700 text-2xl font-black'
                }`}
              >
                {value > 0 ? `+${value}` : value}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 pl-1 items-center">
        {sessionMode === 'LIVE' ? (
          <button
            onClick={() => onUpdate({ isCompleted: !isCompleted })}
            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-sm active:scale-95 ${
              isCompleted 
                ? 'bg-emerald-500 text-white shadow-emerald-100' 
                : 'bg-slate-50 text-indigo-400 border border-indigo-50 hover:bg-indigo-600 hover:text-white'
            }`}
            title={isCompleted ? "Unmark Set" : "Complete Set"}
          >
            <Check size={24} strokeWidth={isCompleted ? 4 : 2} />
          </button>
        ) : (
          <button
            onClick={() => onRemove()}
            className="w-12 h-12 flex items-center justify-center bg-slate-100 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 active:scale-95 transition-all"
            title="Remove Set"
          >
            <Trash2 size={20} />
          </button>
        )}
        
        {sessionMode === 'LIVE' && isCompleted && (
          <button
            onClick={() => onRemove()}
            className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white active:scale-95 transition-all"
            title="Remove Set"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </motion.div>
  );
};
