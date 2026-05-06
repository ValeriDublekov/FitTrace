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
  onExerciseFinish?: () => void;
}

export const ActiveSession: React.FC<ActiveSessionProps> = ({
  onAddClick,
  onFinish,
  onExerciseFinish
}) => {
  const { 
    activeExercises, 
    workoutNotes, 
    setWorkoutNotes, 
    sessionMode,
    isSaving, 
    restTimer,
    clearRestTimer
  } = useWorkoutContext();
  const { exercises } = useExercises();

  return (
    <div className="space-y-8 pb-32">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2">
            <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full inline-block ${
              sessionMode === 'LIVE'
                ? 'text-indigo-600 bg-indigo-50 border border-indigo-100' 
                : 'text-amber-600 bg-amber-50 border border-amber-100'
            }`}>
              {sessionMode === 'LIVE' ? '🔴 Live Session' : '📝 Manual Log'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <button
            onClick={onAddClick}
            className="w-14 h-14 flex items-center justify-center bg-slate-900 text-white rounded-2xl hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-200"
            title="Add Exercise"
          >
            <Plus size={28} strokeWidth={2.5} />
          </button>
        </div>
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
                onFinish={onExerciseFinish}
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
        </>
      )}

      <RestTimer seconds={restTimer} onClear={clearRestTimer} />
    </div>
  );
};
