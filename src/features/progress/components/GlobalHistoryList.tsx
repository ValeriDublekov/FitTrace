import React from 'react';
import { Calendar, Trash2, History as HistoryIcon, Clock, GitMerge } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Workout, Exercise } from '../../../types';
import { formatDuration } from '../../../utils/dateUtils';
import { getCategoryColorScheme } from '../../../utils/colorUtils';

interface GlobalHistoryListProps {
  history: Workout[];
  loading: boolean;
  exercises: Exercise[];
  onSelectWorkout: (workout: Workout) => void;
  onDeleteWorkout: (id: string) => void;
  onMergeWorkouts?: (laterWorkout: Workout, earlierWorkout: Workout) => void;
}

export const GlobalHistoryList: React.FC<GlobalHistoryListProps> = ({
  history,
  loading,
  exercises,
  onSelectWorkout,
  onDeleteWorkout,
  onMergeWorkouts
}) => {
  const { t, i18n } = useTranslation();

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center">
        <HistoryIcon className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-zinc-900">{t('workout.progress.no_workouts')}</h3>
        <p className="text-zinc-500">{t('workout.progress.no_workouts_desc')}</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      {history.map((workout, idx) => {
        const nextWorkout = history[idx + 1];
        const canMerge = nextWorkout && (
          workout.date.getFullYear() === nextWorkout.date.getFullYear() &&
          workout.date.getMonth() === nextWorkout.date.getMonth() &&
          workout.date.getDate() === nextWorkout.date.getDate()
        );

        return (
          <div 
            key={workout.id} 
            className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm group hover:border-indigo-200 transition-all cursor-pointer"
            onClick={() => onSelectWorkout(workout)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base sm:text-lg">
                    {workout.date.toLocaleDateString(i18n.language, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="text-zinc-500 text-[10px] sm:text-xs">
                      {t('workout.progress.exercises_logged', { count: workout.exercises.length })}
                    </p>
                    {workout.durationSeconds && workout.durationSeconds > 0 && (
                      <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] sm:text-xs">
                        <div className="w-1 h-1 rounded-full bg-zinc-200" />
                        <Clock className="w-3 h-3" />
                        <span>{formatDuration(workout.durationSeconds)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 shrink-0">
                {canMerge && onMergeWorkouts && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMergeWorkouts(workout, nextWorkout);
                    }}
                    className="px-3 py-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 active:scale-95 rounded-xl transition-all flex items-center gap-1 text-xs font-black uppercase tracking-wider border border-indigo-100 shadow-sm"
                    title={t('workout.progress.merge_btn')}
                  >
                    <GitMerge className="w-4 h-4 text-indigo-600" />
                    <span className="hidden xs:inline">{t('workout.progress.merge_btn')}</span>
                  </button>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteWorkout(workout.id);
                  }}
                  className="p-3 md:p-2 text-zinc-500 md:text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                  title="Изтрий тренировка"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {(() => {
                const cats: string[] = Array.from(new Set(
                  workout.exercises
                    .map(ex => exercises.find(e => e.id === ex.exerciseId)?.category)
                    .filter((cat): cat is string => !!cat)
                ));
                return cats.map((cat, i) => {
                  const colors = getCategoryColorScheme(cat);
                  return (
                    <span key={i} className={`text-xs font-black border px-3 py-1.5 rounded-xl uppercase tracking-tighter shadow-sm transition-colors ${colors.text} ${colors.bg} ${colors.border}`}>
                      {t(`workout.categories.${cat.toLowerCase().replace(' ', '_')}`)}
                    </span>
                  );
                });
              })()}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
};
