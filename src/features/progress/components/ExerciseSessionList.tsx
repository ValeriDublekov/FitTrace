import React from 'react';
import { Calendar, Trash2, History as HistoryIcon, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Workout, Exercise } from '../../../types';
import { formatDuration } from '../../../utils/dateUtils';

interface ExerciseSessionListProps {
  history: Workout[];
  selectedExercise: Exercise;
  onDeleteWorkout: (id: string) => void;
  onSelectWorkout?: (workout: Workout) => void;
}

export const ExerciseSessionList: React.FC<ExerciseSessionListProps> = ({
  history,
  selectedExercise,
  onDeleteWorkout,
  onSelectWorkout
}) => {
  const { t, i18n } = useTranslation();

  if (history.length === 0) {
    return (
      <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <HistoryIcon className="text-amber-500" />
        </div>
        <h3 className="text-lg font-bold text-zinc-900">{t('workout.progress.no_history')}</h3>
        <p className="text-zinc-500 text-sm">{t('workout.progress.no_history_desc')}</p>
      </div>
    );
  }

  const unit = selectedExercise.loadType === 'WEIGHT_REPS' ? 'kg' : 'Level';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-zinc-900 font-bold">
        <HistoryIcon className="w-5 h-5 text-indigo-600" />
        {t('workout.progress.recent_sessions')}
      </div>
      <div className="space-y-3">
        {history.map((workout) => {
          const instances = workout.exercises.filter(e => e.exerciseId === selectedExercise.id);
          const totalSets = instances.reduce((sum, ex) => sum + ex.sets.length, 0);
          const maxPerformance = instances.reduce((max, ex) => {
            const instanceMax = ex.sets.reduce((sMax, s) => {
              const val = selectedExercise.loadType === 'WEIGHT_REPS' ? (s.weight || 0) : (s.level || 0);
              return val > sMax ? val : sMax;
            }, 0);
            return instanceMax > max ? instanceMax : max;
          }, 0);

          return (
            <div 
              key={workout.id} 
              onClick={() => onSelectWorkout?.(workout)}
              className="bg-white border border-zinc-200 rounded-2xl p-4 flex justify-between items-center group hover:border-indigo-200 transition-colors shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="bg-zinc-50 p-2.5 rounded-xl text-zinc-500 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-zinc-900">
                    {workout.date.toLocaleDateString(i18n.language, { weekday: 'short', month: 'short', day: 'numeric' })}
                    {instances.some(ex => ex.sessionNotes) && (
                      <span className="ml-2 text-[10px] font-medium text-slate-500 italic">
                        ({instances.map(ex => ex.sessionNotes).filter(Boolean).join('; ')})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span>{t('workout.progress.sets_logged', { count: totalSets })}</span>
                    {workout.durationSeconds && workout.durationSeconds > 0 && (
                      <>
                        <div className="w-1 h-1 rounded-full bg-zinc-200" />
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDuration(workout.durationSeconds)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-lg font-black text-zinc-900">
                    {maxPerformance}
                    <span className="text-[10px] font-bold text-zinc-400 ml-1 uppercase">{unit}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteWorkout(workout.id);
                  }}
                  className="p-3 md:p-2 text-zinc-500 md:text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                  title="Изтрий тренировка"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
