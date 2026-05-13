import React from 'react';
import { History } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Exercise, Workout } from '../../../types';

interface ExerciseHistoryViewProps {
  exercise: Exercise;
  history: Workout[];
  loading: boolean;
  showAll: boolean;
  onToggleAll: () => void;
}

export const ExerciseHistoryView: React.FC<ExerciseHistoryViewProps> = ({
  exercise,
  history,
  loading,
  showAll,
  onToggleAll
}) => {
  const { t } = useTranslation();

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
          <History size={12} />
          {t('workout.historical_data')}
        </h4>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-4">
          <div className="w-5 h-5 border-2 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      ) : history.length > 0 ? (
        <div className="space-y-4">
          {(showAll ? history : [history[0]]).map((workout, idx) => {
            const workoutExercise = workout.exercises.find(e => e.exerciseId === exercise.id);
            if (!workoutExercise) return null;
            
            const isLast = !showAll || idx === 0;

            return (
              <div key={workout.id || idx} className={`bg-white p-4 rounded-2xl border ${isLast ? 'border-indigo-100 shadow-md ring-1 ring-indigo-50' : 'border-slate-100 shadow-sm'}`}>
                <div className="flex justify-between items-center mb-3">
                  <span className={`${isLast ? 'text-xs' : 'text-[10px]'} font-bold text-slate-500 uppercase tracking-tight`}>
                    {new Date(workout.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className={`font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-widest ${isLast ? 'text-[10px]' : 'text-[8px]'}`}>
                    {workoutExercise.sets.length} {t('workout.sets')}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {workoutExercise.sets.map((s, i) => (
                    <div key={i} className={`flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-100 ${isLast ? 'p-3 min-w-[70px]' : 'p-2 min-w-[50px]'}`}>
                      <span className={`${isLast ? 'text-2xl' : 'text-sm'} font-black text-slate-900 leading-none`}>
                        {exercise.loadType === 'WEIGHT_REPS' ? s.weight : 
                         exercise.loadType === 'LEVEL_REPS' ? s.level : 
                         s.level}
                        <small className="text-[10px] ml-0.5 text-slate-400 font-bold uppercase">
                          {exercise.loadType === 'WEIGHT_REPS' ? 'kg' : 
                           exercise.loadType === 'LEVEL_REPS' ? 'L' : 'D'}
                        </small>
                      </span>
                      <span className={`${isLast ? 'text-xs' : 'text-[10px]'} font-bold text-slate-400 mt-1`}>
                        × {exercise.loadType === 'CARDIO' ? `${s.duration}m` : s.reps}
                      </span>
                    </div>
                  ))}
                </div>

                {workoutExercise.sessionNotes && (
                  <div className="mt-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                    <p className="text-[11px] font-medium text-slate-600 italic leading-relaxed">
                      “{workoutExercise.sessionNotes}”
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {history.length > 1 && (
            <button
              onClick={onToggleAll}
              className="w-full py-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-white rounded-xl border border-dashed border-indigo-200 transition-colors"
            >
              {showAll ? t('common.back') : t('workout.progress.all_history')}
            </button>
          )}
        </div>
      ) : (
        <p className="text-center text-xs font-bold text-slate-400 py-4 italic">{t('workout.no_history')}</p>
      )}
    </div>
  );
};
