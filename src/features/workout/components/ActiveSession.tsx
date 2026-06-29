import React, { useState } from 'react';
import { Plus, Link2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ExerciseLogger } from './ExerciseLogger';
import { SupersetLogger } from './SupersetLogger';
import { CollapsedSupersetItem } from './CollapsedSupersetItem';
import { RestTimer } from './RestTimer';
import { useWorkoutContext } from '../context/WorkoutSessionContext';
import { useExercises } from '../../../hooks/useExercises';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { ActionPromptModal } from '../../../components/ui/ActionPromptModal';
import { CombineExercisesModal } from '../../../components/ui/CombineExercisesModal';

// Sub-components
import { ActiveSessionHeader } from './ActiveSessionHeader';
import { CollapsedExerciseItem } from './CollapsedExerciseItem';
import { ActiveSessionFooter } from './ActiveSessionFooter';

interface ActiveSessionProps {
  onAddClick: () => void;
  onFinish: () => void;
}

export const ActiveSession: React.FC<ActiveSessionProps> = ({
  onAddClick,
  onFinish
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
    removeIncompleteSets,
    combineExercises
  } = useWorkoutContext();
  const { exercises } = useExercises();
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<string | null>(null);
  const [showCombineModal, setShowCombineModal] = useState(false);

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

  // Group active list of exercises by supersetGroupId
  const groupedUnits: {
    type: 'single' | 'superset';
    id: string; // exercise instance ID or supersetGroupId
    exercises: {
      workoutEx: typeof activeExercises[0];
      exercise: typeof exercises[0];
    }[];
  }[] = [];

  const processedGroupIds = new Set<string>();

  activeExercises.forEach((workoutEx) => {
    const exercise = exercises.find(e => e.id === workoutEx.exerciseId);
    if (!exercise) return;

    if (workoutEx.supersetGroupId) {
      if (processedGroupIds.has(workoutEx.supersetGroupId)) return;

      const groupExercises = activeExercises
        .filter(ex => ex.supersetGroupId === workoutEx.supersetGroupId)
        .map(ex => ({
          workoutEx: ex,
          exercise: exercises.find(e => e.id === ex.exerciseId)!
        }))
        .filter(item => item.exercise !== undefined);

      if (groupExercises.length > 1) {
        groupedUnits.push({
          type: 'superset',
          id: workoutEx.supersetGroupId,
          exercises: groupExercises
        });
        processedGroupIds.add(workoutEx.supersetGroupId);
      } else {
        groupedUnits.push({
          type: 'single',
          id: workoutEx.id,
          exercises: [{ workoutEx, exercise }]
        });
      }
    } else {
      groupedUnits.push({
        type: 'single',
        id: workoutEx.id,
        exercises: [{ workoutEx, exercise }]
      });
    }
  });

  const handleExerciseFinish = (currentUnitId: string) => {
    // Find the next incomplete unit and auto-expand it for better UX
    const currentIndex = groupedUnits.findIndex(u => u.id === currentUnitId);
    if (currentIndex !== -1 && currentIndex < groupedUnits.length - 1) {
      for (let i = currentIndex + 1; i < groupedUnits.length; i++) {
        const nextUnit = groupedUnits[i];
        let isCompleted = true;
        for (const ex of nextUnit.exercises) {
          if (ex.workoutEx.sets.some(s => !s.isCompleted)) {
            isCompleted = false;
            break;
          }
        }
        
        if (!isCompleted) {
          setExpandedExerciseId(nextUnit.id);
          return;
        }
      }
    }
    
    // If no next incomplete unit, just collapse
    setExpandedExerciseId(null);
  };

  return (
    <div className="space-y-6 pb-32">
      <ActiveSessionHeader 
        sessionMode={sessionMode} 
        onAddClick={onAddClick} 
      />

      {activeExercises.length >= 2 && (
        <div className="flex justify-end px-1">
          <button
            onClick={() => setShowCombineModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all select-none active:scale-[0.98] border border-indigo-100 shadow-sm"
          >
            <Link2 size={14} strokeWidth={2.5} />
            {t('workout.combine_exercises', 'Комбинирай в Суперсерия')}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {groupedUnits.length > 0 ? (
          groupedUnits.map((unit) => {
            if (unit.type === 'superset') {
              const isExpanded = expandedExerciseId === unit.id;
              return isExpanded ? (
                <div key={unit.id} className="relative">
                  <SupersetLogger
                    groupId={unit.id}
                    exercises={unit.exercises}
                    onFinish={() => handleExerciseFinish(unit.id)}
                  />
                </div>
              ) : (
                <CollapsedSupersetItem
                  key={unit.id}
                  groupId={unit.id}
                  exercises={unit.exercises}
                  onExpand={setExpandedExerciseId}
                  onDeleteRequest={setExerciseToDelete}
                />
              );
            } else {
              const single = unit.exercises[0];
              const isExpanded = expandedExerciseId === single.workoutEx.id;
              return isExpanded ? (
                <div key={single.workoutEx.id} className="relative">
                  <ExerciseLogger
                    exercise={single.exercise}
                    workoutExercise={single.workoutEx}
                    onFinish={() => handleExerciseFinish(single.workoutEx.id)}
                  />
                </div>
              ) : (
                <CollapsedExerciseItem
                  key={single.workoutEx.id}
                  workoutEx={single.workoutEx}
                  exercise={single.exercise}
                  onExpand={setExpandedExerciseId}
                  onDeleteRequest={setExerciseToDelete}
                />
              );
            }
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

      <CombineExercisesModal
        isOpen={showCombineModal}
        activeExercises={activeExercises}
        onCombine={combineExercises}
        onCancel={() => setShowCombineModal(false)}
      />
    </div>
  );
};
