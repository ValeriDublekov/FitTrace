import React, { useState } from 'react';
import { Exercise, WorkoutExercise, ExerciseSet } from '../../../types';
import { useWorkoutContext } from '../context/WorkoutSessionContext';
import { Plus, Check, Trash2, Split, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ActionPromptModal } from '../../../components/ui/ActionPromptModal';

interface SupersetLoggerProps {
  groupId: string;
  exercises: {
    workoutEx: WorkoutExercise;
    exercise: Exercise;
  }[];
  onFinish?: () => void;
}

export const SupersetLogger: React.FC<SupersetLoggerProps> = ({
  groupId,
  exercises,
  onFinish,
}) => {
  const { t } = useTranslation();
  const { 
    updateSet, 
    addSet, 
    removeSet, 
    sessionMode, 
    uncombineSuperset, 
    startRestTimer, 
    updateExerciseNotes,
    clearRestTimer,
    markExerciseAsCompleted,
    removeIncompleteSets
  } = useWorkoutContext();

  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  const handleFinish = (action: 'finish' | 'delete' | 'cancel') => {
    if (action === 'delete') {
      exercises.forEach(item => {
        removeIncompleteSets(item.workoutEx.id);
      });
      clearRestTimer();
      if (onFinish) onFinish();
      setShowFinishConfirm(false);
    } else if (action === 'finish') {
      exercises.forEach(item => {
        markExerciseAsCompleted(item.workoutEx.id);
      });
      clearRestTimer();
      if (onFinish) onFinish();
      setShowFinishConfirm(false);
    } else {
      setShowFinishConfirm(false);
    }
  };

  const maxSetsCount = Math.max(...exercises.map(ex => ex.workoutEx.sets.length), 0);

  const handleAddSetToAll = () => {
    exercises.forEach(item => {
      addSet(item.workoutEx.id);
    });
  };

  const handleRemoveSetFromAll = (setIndex: number) => {
    exercises.forEach(item => {
      removeSet(item.workoutEx.id, setIndex);
    });
  };

  const handleSplit = () => {
    uncombineSuperset(groupId);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border-2 border-indigo-200 shadow-md overflow-hidden"
      >
        {/* Header */}
        <div className="bg-indigo-50/70 border-b border-indigo-100 p-5 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black tracking-widest text-indigo-700 bg-indigo-100/80 px-2.5 py-1 rounded-full uppercase inline-block mb-1">
              {t('workout.superset', 'Суперсерия')}
            </span>
            <h3 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
              {exercises.map(item => item.exercise.name).join(' + ')}
            </h3>
          </div>
          <button
            onClick={handleSplit}
            className="flex items-center gap-1.5 px-3 py-2 bg-white text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-300 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all select-none active:scale-95"
            title={t('workout.split_superset', 'Раздели')}
          >
            <Split size={14} />
            {t('workout.split_superset', 'Раздели')}
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Rounds list */}
          <div className="space-y-4">
            {Array.from({ length: maxSetsCount }).map((_, rc) => {
              const roundIndex = rc + 1;
              return (
                <div key={roundIndex} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100/80 pb-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {t('workout.round', 'Кръг')} #{roundIndex}
                    </span>
                    {maxSetsCount > 1 && (
                      <button
                        onClick={() => handleRemoveSetFromAll(roundIndex)}
                        className="text-slate-400 hover:text-red-500 rounded-lg p-1 transition-colors"
                        title={t('workout.remove_from_all', 'Изтрий за целия кръг')}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {exercises.map((item) => {
                      const set = item.workoutEx.sets.find(s => s.setIndex === roundIndex);
                      if (!set) return null;

                      const isCompleted = set.isCompleted;
                      const canEdit = sessionMode === 'MANUAL' || !isCompleted;
                      const loadType = item.exercise.loadType;

                      const onUpdate = (data: Partial<ExerciseSet>) => {
                        updateSet(item.workoutEx.id, roundIndex, data);
                        if (data.isCompleted && !isCompleted && sessionMode === 'LIVE') {
                          startRestTimer();
                        }
                      };

                      return (
                        <div key={item.workoutEx.id} className="space-y-1.5 border-l-2 border-indigo-200 pl-3">
                          <div className="text-xs font-bold text-indigo-900 tracking-tight">
                            {item.exercise.name}
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="grid grid-cols-2 gap-2">
                                {loadType === 'WEIGHT_REPS' && (
                                  <>
                                    <div className="relative">
                                      <input
                                        type="number"
                                        placeholder="0"
                                        value={set.weight || ''}
                                        disabled={!canEdit}
                                        onChange={(e) => onUpdate({ weight: parseFloat(e.target.value) })}
                                        className="w-full px-2 py-4 bg-white border-2 border-slate-100 rounded-xl text-xl font-black text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all text-center"
                                      />
                                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase pointer-events-none">Kg</span>
                                    </div>
                                    <div className="relative">
                                      <input
                                        type="number"
                                        placeholder="0"
                                        value={set.reps || ''}
                                        disabled={!canEdit}
                                        onChange={(e) => onUpdate({ reps: parseInt(e.target.value) })}
                                        className="w-full px-2 py-4 bg-white border-2 border-slate-100 rounded-xl text-xl font-black text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all text-center"
                                      />
                                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase pointer-events-none">Rps</span>
                                    </div>
                                  </>
                                )}

                                {loadType === 'LEVEL_REPS' && (
                                  <>
                                    <div className="relative">
                                      <input
                                        type="number"
                                        placeholder="0"
                                        value={set.level || ''}
                                        disabled={!canEdit}
                                        onChange={(e) => onUpdate({ level: parseFloat(e.target.value) })}
                                        className="w-full px-2 py-4 bg-white border-2 border-slate-100 rounded-xl text-xl font-black text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all text-center"
                                      />
                                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase pointer-events-none">Lvl</span>
                                    </div>
                                    <div className="relative">
                                      <input
                                        type="number"
                                        placeholder="0"
                                        value={set.reps || ''}
                                        disabled={!canEdit}
                                        onChange={(e) => onUpdate({ reps: parseInt(e.target.value) })}
                                        className="w-full px-2 py-4 bg-white border-2 border-slate-100 rounded-xl text-xl font-black text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all text-center"
                                      />
                                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase pointer-events-none">Rps</span>
                                    </div>
                                  </>
                                )}

                                {loadType === 'CARDIO' && (
                                  <>
                                    <div className="relative">
                                      <input
                                        type="number"
                                        placeholder="0"
                                        value={set.level || ''}
                                        disabled={!canEdit}
                                        onChange={(e) => onUpdate({ level: parseFloat(e.target.value) })}
                                        className="w-full px-2 py-4 bg-white border-2 border-slate-100 rounded-xl text-xl font-black text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all text-center"
                                      />
                                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase pointer-events-none">Diff</span>
                                    </div>
                                    <div className="relative">
                                      <input
                                        type="number"
                                        placeholder="0"
                                        value={set.duration || ''}
                                        disabled={!canEdit}
                                        onChange={(e) => onUpdate({ duration: parseInt(e.target.value) })}
                                        className="w-full px-2 py-4 bg-white border-2 border-slate-100 rounded-xl text-xl font-black text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all text-center"
                                      />
                                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase pointer-events-none">Min</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {sessionMode === 'LIVE' && (
                              <button
                                onClick={() => onUpdate({ isCompleted: !isCompleted })}
                                className={`w-11 h-11 flex flex-shrink-0 items-center justify-center rounded-xl transition-all shadow-sm active:scale-95 ${
                                  isCompleted
                                    ? 'bg-emerald-500 text-white shadow-emerald-100'
                                    : 'bg-white border-2 border-slate-200 text-slate-300 hover:border-indigo-200 hover:text-indigo-600'
                                }`}
                              >
                                <Check size={20} strokeWidth={isCompleted ? 4 : 2} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer controls inside card */}
          <div className="grid grid-cols-2 gap-3 pb-2">
            <button
              onClick={handleAddSetToAll}
              className="flex items-center justify-center gap-2 py-4 bg-slate-50 hover:bg-indigo-50/50 text-indigo-600 border border-slate-200 hover:border-indigo-200 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-[0.98]"
            >
              <Plus size={16} strokeWidth={3} />
              {t('workout.add_round_superset', 'Добави кръг')}
            </button>

            {onFinish && (
              <button
                onClick={() => {
                  const hasIncompleteSets = exercises.some(item => 
                    item.workoutEx.sets.some(s => !s.isCompleted)
                  );
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

          {/* Notes for each exercise in superset */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            {exercises.map((item) => (
              <div key={item.workoutEx.id} className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {t('workout.notes_for', 'Бележки за')} {item.exercise.name}
                </span>
                <textarea
                  value={item.workoutEx.sessionNotes || ''}
                  onChange={(e) => updateExerciseNotes(item.workoutEx.id, e.target.value)}
                  placeholder={t('workout.exercise_notes_placeholder')}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none text-xs min-h-[60px]"
                />
              </div>
            ))}
          </div>
        </div>
      </motion.div>

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
