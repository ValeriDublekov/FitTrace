import React from 'react';
import { Workout } from '../../types';
import { X, Dumbbell } from 'lucide-react';

interface WorkoutDetailsModalProps {
  workout: Workout;
  onClose: () => void;
}

export const WorkoutDetailsModal: React.FC<WorkoutDetailsModalProps> = ({ workout, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="p-4 border-b border-zinc-100 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="font-black text-lg text-zinc-900">
            {workout.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>
        <div className="p-4 space-y-6">
          {workout.exercises.map((ex, exIdx) => (
            <div key={exIdx} className="space-y-2">
              <div className="flex items-center gap-2 font-bold text-zinc-900">
                <Dumbbell className="w-4 h-4 text-indigo-600" />
                {ex.exerciseName}
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold text-zinc-500 bg-zinc-50 py-2 rounded-lg">
                <div>SET</div>
                <div>KG</div>
                <div>REPS</div>
                <div>Status</div>
              </div>
              {ex.sets.map((set, setIdx) => (
                <div key={setIdx} className="grid grid-cols-4 gap-2 text-center text-sm py-2 border-b border-zinc-50 last:border-0">
                  <div className="font-bold text-zinc-900">{setIdx + 1}</div>
                  <div className="text-zinc-600">{set.weight || '-'}</div>
                  <div className="text-zinc-600">{set.reps || '-'}</div>
                  <div className={`text-[10px] font-bold ${set.isCompleted ? 'text-green-600' : 'text-zinc-300'}`}>
                    {set.isCompleted ? '✓' : '—'}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
