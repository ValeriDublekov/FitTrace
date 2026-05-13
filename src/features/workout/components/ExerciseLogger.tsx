import React, { useState } from 'react';
import { Exercise, WorkoutExercise } from '../../../types';
import { SetLogger } from './SetLogger';
import { useExerciseHistory } from '../../../hooks/useExerciseHistory';
import { useWorkoutContext } from '../context/WorkoutSessionContext';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { ActionPromptModal } from '../../../components/ui/ActionPromptModal';
import { ExerciseHistoryView } from './ExerciseHistoryView';
import { ExerciseLoggerHeader } from './ExerciseLoggerHeader';

interface ExerciseLoggerProps {
  exercise: Exercise;
  workoutExercise: WorkoutExercise;
  onFinish?: () => void;
}

export const ExerciseLogger: React.FC<ExerciseLoggerProps> = ({
  exercise,
  workoutExercise,
  onFinish,
}) => {
  const { t } = useTranslation();
  const { updateSet, addSet, removeSet, clearRestTimer, removeExercise, markExerciseAsCompleted, removeIncompleteSets, updateExerciseNotes } = useWorkoutContext();
  const { history, loading: historyLoading } = useExerciseHistory(exercise.id);
  const [showHistory, setShowHistory] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  const handleFinish = (action: 'finish' | 'delete' | 'cancel') => {
    if (action === 'delete') {
      removeIncompleteSets(workoutExercise.id);
      setShowFinishConfirm(false);
    } else if (action === 'finish') {
      markExerciseAsCompleted(workoutExercise.id);
      clearRestTimer();
      if (onFinish) onFinish();
      setShowFinishConfirm(false);
    } else {
      setShowFinishConfirm(false);
    }
  };

  const handleDelete = () => {
    removeExercise(workoutExercise.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <ExerciseLoggerHeader
          exercise={exercise}
          showHistory={showHistory}
          onToggleHistory={() => setShowHistory(!showHistory)}
          onDeleteRequest={() => setShowDeleteConfirm(true)}
        />

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-slate-50"
            >
              <ExerciseHistoryView
                exercise={exercise}
                history={history}
                loading={historyLoading}
                showAll={showAllHistory}
                onToggleAll={() => setShowAllHistory(!showAllHistory)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-5 space-y-4">
          <div className="space-y-3">
            {workoutExercise.sets.map((set) => (
              <SetLogger
                key={set.setIndex}
                set={set}
                exerciseId={workoutExercise.id}
                loadType={exercise.loadType}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => addSet(workoutExercise.id)}
              className="flex items-center justify-center gap-2 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-[0.98]"
            >
              <Plus size={16} strokeWidth={3} />
              {t('workout.add_set')}
            </button>

            {onFinish && (
              <button
                onClick={() => {
                  const hasIncompleteSets = workoutExercise.sets.some(s => !s.isCompleted);
                  if (hasIncompleteSets) {
                    setShowFinishConfirm(true);
                  } else {
                    handleFinish('finish');
                  }
                }}
                className="flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
              >
                {t('workout.finish_ex')}
              </button>
            )}
          </div>

          <div className="pt-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">
              {t('workout.exercise_notes')}
            </h4>
            <textarea
              value={workoutExercise.sessionNotes || ''}
              onChange={(e) => updateExerciseNotes(workoutExercise.id, e.target.value)}
              placeholder={t('workout.exercise_notes_placeholder')}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none text-sm min-h-[80px]"
            />
          </div>
        </div>
      </motion.div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title={t('workout.confirmations.remove_exercise.title')}
        message={t('workout.confirmations.remove_exercise.message')}
        confirmLabel={t('common.delete')}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
      
      <ActionPromptModal
        isOpen={showFinishConfirm}
        title={t('workout.confirmations.finish_exercise.title')}
        message={t('workout.confirmations.finish_exercise.message')}
        yesLabel={t('workout.confirmations.finish_exercise.yes')}
        noLabel={t('workout.confirmations.finish_exercise.no')}
        cancelLabel={t('common.cancel')}
        onYes={() => handleFinish('finish')}
        onNo={() => handleFinish('delete')}
        onCancel={() => handleFinish('cancel')}
      />
    </>
  );
};
