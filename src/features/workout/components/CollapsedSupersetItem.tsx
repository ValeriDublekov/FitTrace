import React from 'react';
import { Plus, X, Split } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Exercise, WorkoutExercise } from '../../../types';
import { useWorkoutContext } from '../context/WorkoutSessionContext';

interface CollapsedSupersetItemProps {
  groupId: string;
  exercises: {
    workoutEx: WorkoutExercise;
    exercise: Exercise;
  }[];
  onExpand: (id: string) => void;
  onDeleteRequest: (id: string) => void;
}

export const CollapsedSupersetItem: React.FC<CollapsedSupersetItemProps> = ({
  groupId,
  exercises,
  onExpand,
  onDeleteRequest,
}) => {
  const { t } = useTranslation();
  const { uncombineSuperset } = useWorkoutContext();

  const maxSetsCount = Math.max(...exercises.map(ex => ex.workoutEx.sets.length), 0);

  const handleSplit = (e: React.MouseEvent) => {
    e.stopPropagation();
    uncombineSuperset(groupId);
  };

  return (
    <div className="group relative">
      <button
        onClick={() => onExpand(groupId)}
        className="w-full flex items-center justify-between p-4 bg-white border-2 border-indigo-200 hover:border-indigo-300 rounded-2xl hover:bg-indigo-50/10 transition-all font-sans relative overflow-hidden"
      >
        <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-indigo-500" />
        
        <div className="flex items-center gap-3 pl-1.5">
          <div className="text-left font-sans min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[8px] font-black tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase">
                {t('workout.superset', 'Суперсерия')}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight break-words leading-tight">
              {exercises.map(item => item.exercise.name).join(' + ')}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <p className="inline-block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                {maxSetsCount} {t('workout.rounds_set', 'кръга')} • {exercises.length} {t('workout.exercises', 'упражнения')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSplit}
            className="p-1 px-2.5 text-[9px] font-black uppercase tracking-wider text-indigo-600 hover:text-white hover:bg-indigo-600 rounded-lg border border-indigo-200 bg-white transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
            title={t('workout.split_superset', 'Раздели')}
          >
            <Split size={12} className="inline mr-1" />
            {t('workout.split', 'Раздели')}
          </button>
          <div className="text-indigo-600 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <Plus size={16} />
          </div>
        </div>
      </button>

      {/* Delete whole superset */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          // We can delete the first exercise in the list to trigger activeSession's exercise delete flow for each
          exercises.forEach(item => {
            onDeleteRequest(item.workoutEx.id);
          });
        }}
        className="absolute -top-2 -right-2 w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all border border-red-100 shadow-sm hover:bg-red-500 hover:text-white"
        title={t('workout.delete_superset', 'Изтрий комбото')}
      >
        <X size={14} strokeWidth={3} />
      </button>
    </div>
  );
};
