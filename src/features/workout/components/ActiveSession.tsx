import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, CheckCircle2, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ExerciseLogger } from './ExerciseLogger';
import { RestTimer } from './RestTimer';
import { useWorkoutContext } from '../context/WorkoutSessionContext';
import { useExercises } from '../../../hooks/useExercises';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { ActionPromptModal } from '../../../components/ui/ActionPromptModal';

interface ActiveSessionProps {
  onAddClick: () => void;
  onFinish: () => void;
  onExerciseFinish?: () => void;
}

export const ActiveSession: React.FC<ActiveSessionProps> = ({
  onAddClick,
  onFinish,
  onExerciseFinish
}) => {
  const { t } = useTranslation();
  const { 
    activeExercises, 
    workoutNotes, 
    setWorkoutNotes, 
    sessionMode,
    restTimer,
    expandedExerciseId,
    setExpandedExerciseId,
    clearRestTimer,
    removeExercise,
    markExerciseAsCompleted,
    removeIncompleteSets
  } = useWorkoutContext();
  const { exercises } = useExercises();
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<string | null>(null);

  const handleFinishWorkout = (action: 'finish' | 'delete' | 'cancel') => {
    if (action === 'delete') {
      const lastExercise = activeExercises[activeExercises.length - 1];
      if (lastExercise) removeIncompleteSets(lastExercise.id);
      onFinish();
    } else if (action === 'finish') {
      const lastExercise = activeExercises[activeExercises.length - 1];
      if (lastExercise) markExerciseAsCompleted(lastExercise.id);
      onFinish();
    } else {
      setShowConfirmFinish(false);
    }
  };

  return (
    <div className="space-y-6 pb-32">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full inline-block ${
            sessionMode === 'LIVE'
              ? 'text-indigo-600 bg-indigo-50 border border-indigo-100' 
              : 'text-amber-600 bg-amber-50 border border-amber-100'
          }`}>
            {sessionMode === 'LIVE' ? t('workout.modes.live') : t('workout.modes.manual')}
          </h2>
        </div>

        <button
          onClick={onAddClick}
          className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-200 font-bold text-xs uppercase tracking-widest"
        >
          <Plus size={20} strokeWidth={2.5} />
          {t('workout.add_exercise')}
        </button>
      </header>

      <div className="space-y-3">
        {activeExercises.length > 0 ? (
          activeExercises
            .map((workoutEx) => {
              const exercise = exercises.find(e => e.id === workoutEx.exerciseId);
              if (!exercise) return null;
              const isExpanded = expandedExerciseId === workoutEx.id;

              if (!isExpanded) {
                return (
                  <div key={workoutEx.id} className="group relative">
                    <button
                      onClick={() => setExpandedExerciseId(workoutEx.id)}
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
                        <div className="text-left font-sans">
                          <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{exercise.name}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{workoutEx.sets.length} {t('workout.sets')}</p>
                        </div>
                      </div>
                      <div className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus size={16} />
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExerciseToDelete(workoutEx.id);
                      }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-red-100 shadow-sm hover:bg-red-500 hover:text-white"
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                  </div>
                );
              }

              return (
                <div key={workoutEx.id} className="relative">
                  <ExerciseLogger
                    exercise={exercise}
                    workoutExercise={workoutEx}
                    onFinish={() => {
                      setExpandedExerciseId(null);
                      if (onExerciseFinish) onExerciseFinish();
                    }}
                  />
                </div>
              );
            })
            .filter((node): node is React.ReactElement => node !== null)
        ) : (
          <div className="text-center py-16 px-6 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
              <Plus size={32} />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-black text-slate-900 tracking-tight">{t('workout.empty_session')}</p>
              <p className="text-sm text-slate-500">{t('workout.pick_exercise')}</p>
            </div>
            <button 
              onClick={onAddClick}
              className="mt-4 px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all"
            >
              {t('workout.select_first')}
            </button>
          </div>
        )}
      </div>

      {activeExercises.length > 0 && (
        <>
          <div className="space-y-4 pt-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">{t('workout.notes')}</h4>
            <textarea
              placeholder={t('workout.notes_placeholder')}
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              className="w-full p-5 bg-white border border-slate-200 rounded-3xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all min-h-[100px] resize-none"
            />
          </div>
          
          <button
            onClick={() => {
              const lastExercise = activeExercises[activeExercises.length - 1];
              const hasIncompleteSets = lastExercise?.sets.some(s => !s.isCompleted);
              if (hasIncompleteSets) {
                setShowConfirmFinish(true);
              } else {
                handleFinishWorkout('finish');
              }
            }}
            className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={20} />
            {t('workout.finish_workout')}
          </button>
        </>
      )}

      <RestTimer seconds={restTimer} onClear={clearRestTimer} />
      
      <ActionPromptModal
        isOpen={showConfirmFinish}
        title={t('workout.confirmations.finish_workout.title')}
        message={t('workout.confirmations.finish_workout.message')}
        yesLabel={t('workout.confirmations.finish_workout.yes')}
        noLabel={t('workout.confirmations.finish_workout.no')}
        cancelLabel={t('common.cancel')}
        onYes={() => handleFinishWorkout('finish')}
        onNo={() => handleFinishWorkout('delete')}
        onCancel={() => handleFinishWorkout('cancel')}
      />

      <ConfirmModal
        isOpen={exerciseToDelete !== null}
        title={t('workout.confirmations.remove_exercise.title')}
        message={t('workout.confirmations.remove_exercise.message')}
        confirmLabel={t('common.delete')}
        onConfirm={() => {
          if (exerciseToDelete) removeExercise(exerciseToDelete);
          setExerciseToDelete(null);
        }}
        onCancel={() => setExerciseToDelete(null)}
      />
    </div>
  );
};
