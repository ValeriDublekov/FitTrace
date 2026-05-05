import React from 'react';
import { motion } from 'motion/react';
import { Plus, CheckCircle2 } from 'lucide-react';
import { ExerciseLogger } from './ExerciseLogger';
import { RestTimer } from './RestTimer';
import { useWorkoutContext } from '../context/WorkoutSessionContext';
import { useExercises } from '../../../hooks/useExercises';

interface ActiveSessionProps {
  onAddClick: () => void;
  onFinish: () => void;
}

export const ActiveSession: React.FC<ActiveSessionProps> = ({
  onAddClick,
  onFinish
}) => {
  const { activeExercises, workoutNotes, setWorkoutNotes, isSaving, restTimer } = useWorkoutContext();
  const { exercises } = useExercises();

  return (
    <div className="space-y-8 pb-32">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block">Active</h2>
          <p className="text-2xl font-black text-slate-900 tracking-tight">Today's Workout</p>
        </div>
        <button
          onClick={onAddClick}
          className="w-12 h-12 flex items-center justify-center bg-slate-900 text-white rounded-2xl hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-200"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      </header>

      <div className="space-y-6">
        {activeExercises.length > 0 ? (
          activeExercises.map((workoutEx) => {
            const exercise = exercises.find(e => e.id === workoutEx.exerciseId);
            if (!exercise) return null;
            return (
              <ExerciseLogger
                key={workoutEx.exerciseId}
                exercise={exercise}
                workoutExercise={workoutEx}
              />
            );
          })
        ) : (
          <div className="text-center py-20 px-6 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
              <Plus size={32} />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-black text-slate-900">Your session is empty</p>
              <p className="text-sm text-slate-500">Start by adding your first exercise.</p>
            </div>
            <button 
              onClick={onAddClick}
              className="mt-4 px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all"
            >
              Add Exercise
            </button>
          </div>
        )}
      </div>

      {activeExercises.length > 0 && (
        <>
          <div className="space-y-4 pt-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Session Notes</h4>
            <textarea
              placeholder="How are you feeling today? Any specific goals..."
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              className="w-full p-5 bg-white border border-slate-200 rounded-3xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all min-h-[100px] resize-none"
            />
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pointer-events-none z-40">
            <div className="max-w-xl mx-auto w-full pointer-events-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSaving}
                onClick={onFinish}
                className="w-full bg-slate-900 text-white p-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-slate-300 disabled:bg-slate-400 transition-all"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 rounded-full border-t-white animate-spin"></div>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Finish Workout
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </>
      )}

      <RestTimer seconds={restTimer} onClear={() => {}} />
    </div>
  );
};
