import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ExerciseLogger } from './ExerciseLogger';
import { RestTimer } from './RestTimer';
import { useWorkoutContext } from '../context/WorkoutSessionContext';
import { useExercises } from '../../../hooks/useExercises';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { ActionPromptModal } from '../../../components/ui/ActionPromptModal';

// Sub-components
import { ActiveSessionHeader } from './ActiveSessionHeader';
import { CollapsedExerciseItem } from './CollapsedExerciseItem';
import { ActiveSessionFooter } from './ActiveSessionFooter';

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
      <ActiveSessionHeader 
        sessionMode={sessionMode} 
        onAddClick={onAddClick} 
      />

      <div className="space-y-3">
        {activeExercises.length > 0 ? (
          activeExercises.map((workoutEx) => {
            const exercise = exercises.find(e => e.id === workoutEx.exerciseId);
            if (!exercise) return null;
            const isExpanded = expandedExerciseId === workoutEx.id;

            return isExpanded ? (
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
            ) : (
              <CollapsedExerciseItem
                key={workoutEx.id}
                workoutEx={workoutEx}
                exercise={exercise}
                onExpand={setExpandedExerciseId}
                onDeleteRequest={setExerciseToDelete}
              />
            );
          })
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
        <ActiveSessionFooter 
          workoutNotes={workoutNotes}
          setWorkoutNotes={setWorkoutNotes}
          onFinishRequest={() => {
            const lastExercise = activeExercises[activeExercises.length - 1];
            const hasIncompleteSets = lastExercise?.sets.some(s => !s.isCompleted);
            if (hasIncompleteSets) {
              setShowConfirmFinish(true);
            } else {
              handleFinishWorkout('finish');
            }
          }}
        />
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
