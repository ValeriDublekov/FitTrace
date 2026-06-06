import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Workout, Exercise, ExerciseSet, normalizeSets } from '../../types';
import { X, Dumbbell, Pencil, Clock, Award, Layers } from 'lucide-react';
import { formatDuration } from '../../utils/dateUtils';

interface WorkoutDetailsModalProps {
  workout: Workout;
  onClose: () => void;
  onEdit?: (workout: Workout) => void;
  onDelete?: (id: string) => void;
  exercises?: Exercise[];
}

export const WorkoutDetailsModal: React.FC<WorkoutDetailsModalProps> = ({ 
  workout, 
  onClose,
  onEdit,
  onDelete,
  exercises = []
}) => {
  const { t, i18n } = useTranslation();
  const [isDetailed, setIsDetailed] = useState(false);

  const getExerciseInfo = (exerciseId: string) => {
    return exercises.find(e => e.id === exerciseId);
  };

  const getMaxPerformance = (sets: ExerciseSet[], loadType: string) => {
    const completedSets = sets.filter(s => s.isCompleted);
    const targetSets = completedSets.length > 0 ? completedSets : sets;
    
    if (targetSets.length === 0) return '—';
    
    if (loadType === 'CARDIO') {
      const maxDur = Math.max(...targetSets.map(s => s.duration || 0));
      const maxLvl = Math.max(...targetSets.map(s => s.level || 0));
      if (maxDur > 0 && maxLvl > 0) {
        return `Lvl ${maxLvl} (${maxDur}m)`;
      } else if (maxDur > 0) {
        return `${maxDur}m`;
      } else if (maxLvl > 0) {
        return `Lvl ${maxLvl}`;
      }
      return '—';
    } else if (loadType === 'LEVEL_REPS') {
      const maxLvl = Math.max(...targetSets.map(s => s.level || 0));
      return maxLvl > 0 ? `Lvl ${maxLvl}` : '—';
    } else {
      // WEIGHT_REPS
      const maxWt = Math.max(...targetSets.map(s => s.weight || 0));
      return maxWt > 0 ? `${maxWt} kg` : '—';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
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
                onClick={() => {
                  const normalizedWorkout = {
                    ...workout,
                    exercises: workout.exercises.map(ex => ({
                      ...ex,
                      sets: normalizeSets(ex.sets)
                    }))
                  };
                  onEdit(normalizedWorkout);
                }}
                className="p-2.5 bg-zinc-50 text-zinc-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
                title={t('common.edit')}
              >
                <Pencil className="w-5 h-5" />
              </button>
            )}
            <button onClick={onClose} className="p-2.5 hover:bg-zinc-100 rounded-xl transition-all col-span-1">
              <X className="w-5 h-5 text-zinc-500" />
            </button>
          </div>
        </div>

        {/* View Switcher Controls (Compact vs Detailed) */}
        <div className="px-6 pt-4 bg-white">
          <div className="flex bg-zinc-100 p-1 rounded-2xl gap-1 border border-zinc-200/50">
            <button
              onClick={() => setIsDetailed(false)}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                !isDetailed
                  ? 'bg-zinc-900 text-white shadow-md'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Layers size={14} />
              {t('workout.compact_view')}
            </button>
            <button
              onClick={() => setIsDetailed(true)}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                isDetailed
                  ? 'bg-zinc-900 text-white shadow-md'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Dumbbell size={14} />
              {t('workout.detailed_view')}
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {isDetailed ? (
            /* DETAILED VIEW - ORIGINAL LAYOUT */
            <div className="space-y-8">
              {workout.exercises.map((ex, exIdx) => {
                const exerciseInfo = getExerciseInfo(ex.exerciseId);
                const loadType = exerciseInfo?.loadType || 'WEIGHT_REPS';
                const isWeight = loadType === 'WEIGHT_REPS';
                const isLevel = loadType === 'LEVEL_REPS';
                const isCardio = loadType === 'CARDIO';
                const finalAffectedPart = exerciseInfo?.affectedPart || ex.affectedPart;

                return (
                  <div key={exIdx} className="space-y-2">
                    <div className="flex items-center justify-between font-bold text-zinc-900">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-indigo-600" />
                        {ex.exerciseName} {finalAffectedPart ? `(${finalAffectedPart})` : ''}
                      </div>
                      {ex.sessionNotes && (
                        <span className="text-[10px] font-medium text-slate-500 italic">
                          {ex.sessionNotes}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-black text-zinc-400 uppercase bg-zinc-50 py-2 rounded-lg tracking-widest">
                      <div>{t('workout.sets')}</div>
                      <div>
                        {isWeight ? t('workout.weight') : (isLevel || isCardio) ? t('workout.level') : t('workout.weight')}
                      </div>
                      <div>
                        {isCardio ? t('workout.duration') : t('workout.reps')}
                      </div>
                      <div className="text-right pr-2">Status</div>
                    </div>
                    {ex.sets.map((set, setIdx) => (
                      <div key={setIdx} className="grid grid-cols-4 gap-2 text-center text-sm py-2 border-b border-zinc-50 last:border-0 items-center">
                        <div className="font-bold text-zinc-900">{setIdx + 1}</div>
                        <div className="text-zinc-600 font-medium">
                          {(isWeight ? set.weight : (isLevel || isCardio) ? set.level : set.weight) ?? '-'}
                        </div>
                        <div className="text-zinc-600 font-medium">
                          {(isCardio ? set.duration : set.reps) ?? '-'}
                          {isCardio && <span className="text-[10px] ml-0.5">m</span>}
                        </div>
                        <div className={`flex justify-end pr-3 font-bold ${set.isCompleted ? 'text-green-600' : 'text-zinc-300'}`}>
                          {set.isCompleted ? '✓' : '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ) : (
            /* COMPACT VIEW - ONLY SHOWS CATEGORY, AREA/ZONE, EXERCISE NAME, AND MAX WEIGHT/PERFORMANCE */
            <div className="space-y-3">
              {workout.exercises.map((ex, exIdx) => {
                const exerciseInfo = getExerciseInfo(ex.exerciseId);
                const loadType = exerciseInfo?.loadType || 'WEIGHT_REPS';
                
                // Muscle group (Категория)
                const categoryKey = exerciseInfo?.category || 'full_body';
                const muscleGroupLabel = t(`workout.categories.${categoryKey.toLowerCase().replace(' ', '_')}`, { defaultValue: categoryKey });
                
                // Zone (Целева Мускулна Зона)
                const targetArea = exerciseInfo?.affectedPart || ex.affectedPart || '';

                // Maximum Weight/Performance
                const maxPerformanceScore = getMaxPerformance(ex.sets, loadType);

                return (
                  <div 
                    key={exIdx} 
                    className="p-4 bg-zinc-50 hover:bg-zinc-100/50 border border-zinc-150 rounded-2xl flex items-center justify-between gap-4 transition-all"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      {/* Name of Exercise */}
                      <h3 className="font-bold text-zinc-900 text-sm leading-snug break-words uppercase">
                        {ex.exerciseName}
                      </h3>
                      
                      {/* Muscle Group & Zone info */}
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {muscleGroupLabel}
                        </span>
                        {targetArea && (
                          <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            {targetArea}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Max Weight / Performance Box */}
                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider flex items-center justify-end gap-1">
                        <Award className="w-3 h-3 text-amber-500" />
                        {t('workout.max_weight')}
                      </span>
                      <span className="text-sm font-black text-zinc-900 bg-white border border-zinc-200/60 px-3 py-1 rounded-xl shadow-xs inline-block mt-1">
                        {maxPerformanceScore}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
