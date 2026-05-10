import React from 'react';
import { Exercise, WorkoutExercise } from '../../../types';
import { SetLogger } from './SetLogger';
import { useExerciseHistory } from '../../../hooks/useExerciseHistory';
import { useWorkoutContext } from '../context/WorkoutSessionContext';
import { Plus, History, ChevronUp, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { ActionPromptModal } from '../../../components/ui/ActionPromptModal';

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
  const { updateSet, addSet, removeSet, clearRestTimer, removeExercise, markExerciseAsCompleted, removeIncompleteSets } = useWorkoutContext();
  const { history, loading: historyLoading } = useExerciseHistory(exercise.id);
  const [showHistory, setShowHistory] = React.useState(false);
  const [showAllHistory, setShowAllHistory] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = React.useState(false);

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
        <header className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 overflow-hidden flex-shrink-0">
              {exercise.thumbnailUrl ? (
                <img src={exercise.thumbnailUrl} alt={exercise.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-300 uppercase tracking-tighter">No img</div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 tracking-tight">{exercise.name}</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{exercise.category}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {exercise.url && (
              <a 
                href={exercise.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
              >
                <ExternalLink size={20} />
              </a>
            )}
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
            >
              {showHistory ? <ChevronUp size={20} /> : <History size={20} />}
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-slate-50"
          >
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <History size={12} />
                  {t('workout.historical_data')}
                </h4>
              </div>
              
              {historyLoading ? (
                <div className="flex justify-center p-4">
                  <div className="w-5 h-5 border-2 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
              ) : history.length > 0 ? (
                <div className="space-y-4">
                  {(showAllHistory ? history : [history[0]]).map((workout, idx) => {
                    const workoutExercise = workout.exercises.find(e => e.exerciseId === exercise.id);
                    if (!workoutExercise) return null;
                    
                    const isLast = !showAllHistory || idx === 0;

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
                      </div>
                    );
                  })}

                  {history.length > 1 && (
                    <button
                      onClick={() => setShowAllHistory(!showAllHistory)}
                      className="w-full py-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-white rounded-xl border border-dashed border-indigo-200 transition-colors"
                    >
                      {showAllHistory ? t('common.back') : t('workout.progress.all_history')}
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-center text-xs font-bold text-slate-400 py-4 italic">{t('workout.no_history')}</p>
              )}
            </div>
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
      onYes={() => handleFinish( 'finish' )}
      onNo={() => handleFinish( 'delete' )}
      onCancel={() => handleFinish( 'cancel' )}
    />
  </>
);
};
