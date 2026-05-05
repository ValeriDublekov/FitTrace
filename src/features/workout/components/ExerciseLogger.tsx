import React from 'react';
import { Exercise, WorkoutExercise } from '../../../types';
import { SetLogger } from './SetLogger';
import { useExerciseHistory } from '../../../hooks/useExerciseHistory';
import { useWorkoutContext } from '../context/WorkoutSessionContext';
import { Plus, History, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExerciseLoggerProps {
  exercise: Exercise;
  workoutExercise: WorkoutExercise;
}

export const ExerciseLogger: React.FC<ExerciseLoggerProps> = ({
  exercise,
  workoutExercise,
}) => {
  const { updateSet, addSet, removeSet } = useWorkoutContext();
  const { history, loading: historyLoading } = useExerciseHistory(exercise.id);
  const [showHistory, setShowHistory] = React.useState(false);

  return (
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
        
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
        >
          {showHistory ? <ChevronUp size={20} /> : <History size={20} />}
        </button>
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
                  Historical Data
                </h4>
              </div>
              
              {historyLoading ? (
                <div className="flex justify-center p-4">
                  <div className="w-5 h-5 border-2 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
              ) : history.length > 0 ? (
                <div className="space-y-3">
                  {history.map((workout, idx) => (
                    <div key={workout.id || idx} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-900">{new Date(workout.date).toLocaleDateString()}</span>
                        <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-widest">
                          {workout.exercises.find(e => e.exerciseId === exercise.id)?.sets.length} Sets
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {workout.exercises.find(e => e.exerciseId === exercise.id)?.sets.map((s, i) => (
                          <span key={i} className="text-[10px] font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">
                            {exercise.loadType === 'WEIGHT_REPS' ? `${s.weight}kg × ${s.reps}` : 
                             exercise.loadType === 'LEVEL_REPS' ? `L${s.level} × ${s.reps}` : 
                             `D${s.level} × ${s.duration}m`}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-xs font-bold text-slate-400 py-4 italic">No previous logs for this exercise.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-5 space-y-3">
        <div className="space-y-3">
          {workoutExercise.sets.map((set) => (
            <SetLogger
              key={set.setIndex}
              set={set}
              exerciseId={workoutExercise.exerciseId}
              loadType={exercise.loadType}
            />
          ))}
        </div>

        <button
          onClick={() => addSet(workoutExercise.exerciseId)}
          className="w-full py-4 mt-2 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-black text-xs uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-400 transition-all active:scale-[0.98]"
        >
          <Plus size={16} strokeWidth={3} />
          Add Set
        </button>
      </div>
    </motion.div>
  );
};
