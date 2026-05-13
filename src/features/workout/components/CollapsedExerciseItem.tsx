import React from 'react';
import { Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Exercise, WorkoutExercise } from '../../../types';

interface CollapsedExerciseItemProps {
  workoutEx: WorkoutExercise;
  exercise: Exercise;
  onExpand: (id: string) => void;
  onDeleteRequest: (id: string) => void;
}

export const CollapsedExerciseItem: React.FC<CollapsedExerciseItemProps> = ({
  workoutEx,
  exercise,
  onExpand,
  onDeleteRequest
}) => {
  const { t } = useTranslation();

  return (
    <div className="group relative">
      <button
        onClick={() => onExpand(workoutEx.id)}
        className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-sans"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
            {exercise.thumbnailUrl ? (
              <img src={exercise.thumbnailUrl} alt={exercise.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-[8px] font-bold text-slate-300">N/A</div>
            )}
          </div>
          <div className="text-left font-sans min-w-0">
            <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight break-words leading-tight">{exercise.name}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5 [.font-size-large_&]:hidden [.font-size-xlarge_&]:hidden">
              {workoutEx.sets.length} {t('workout.sets')}
            </p>
          </div>
        </div>
        <div className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <Plus size={16} />
        </div>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeleteRequest(workoutEx.id);
        }}
        className="absolute -top-2 -right-2 w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-red-100 shadow-sm hover:bg-red-500 hover:text-white"
      >
        <X size={14} strokeWidth={3} />
      </button>
    </div>
  );
};
