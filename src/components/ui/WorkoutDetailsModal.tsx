import React from 'react';
import { useTranslation } from 'react-i18next';
import { Workout } from '../../types';
import { X, Dumbbell, Pencil, Clock } from 'lucide-react';
import { formatDuration } from '../../utils/dateUtils';

interface WorkoutDetailsModalProps {
  workout: Workout;
  onClose: () => void;
  onEdit?: (workout: Workout) => void;
  onDelete?: (id: string) => void;
}

export const WorkoutDetailsModal: React.FC<WorkoutDetailsModalProps> = ({ 
  workout, 
  onClose,
  onEdit,
  onDelete
}) => {
  const { t, i18n } = useTranslation();
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="font-black text-xl text-zinc-900 leading-tight">
              {workout.date.toLocaleDateString(i18n.language, { weekday: 'long', month: 'long', day: 'numeric' })}
            </h2>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                 {t('workout.progress.exercises_logged', { count: workout.exercises.length })}
               </span>
               {workout.durationSeconds && workout.durationSeconds > 0 && (
                 <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                   <Clock className="w-2.5 h-2.5" />
                   {formatDuration(workout.durationSeconds)}
                 </span>
               )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button 
                onClick={() => onEdit(workout)}
                className="p-2.5 bg-zinc-50 text-zinc-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
                title={t('common.edit')}
              >
                <Pencil className="w-5 h-5" />
              </button>
            )}
            <button onClick={onClose} className="p-2.5 hover:bg-zinc-100 rounded-xl transition-all">
              <X className="w-5 h-5 text-zinc-500" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-8 overflow-y-auto flex-1">
          {workout.exercises.map((ex, exIdx) => (
            <div key={exIdx} className="space-y-2">
              <div className="flex items-center gap-2 font-bold text-zinc-900">
                <Dumbbell className="w-4 h-4 text-indigo-600" />
                {ex.exerciseName}
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold text-zinc-500 bg-zinc-50 py-2 rounded-lg">
                <div>SET</div>
                <div>KG</div>
                <div>REPS</div>
                <div>Status</div>
              </div>
              {ex.sets.map((set, setIdx) => (
                <div key={setIdx} className="grid grid-cols-4 gap-2 text-center text-sm py-2 border-b border-zinc-50 last:border-0">
                  <div className="font-bold text-zinc-900">{setIdx + 1}</div>
                  <div className="text-zinc-600">{set.weight || '-'}</div>
                  <div className="text-zinc-600">{set.reps || '-'}</div>
                  <div className={`text-[10px] font-bold ${set.isCompleted ? 'text-green-600' : 'text-zinc-300'}`}>
                    {set.isCompleted ? '✓' : '—'}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
