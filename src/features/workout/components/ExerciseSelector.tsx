import React from 'react';
import { Search } from 'lucide-react';
import { Exercise } from '../../../types';
import { ExerciseCard } from './ExerciseCard';

interface ExerciseSelectorProps {
  category: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredExercises: Exercise[];
  onAddExercise: (exercise: Exercise) => void;
  loading: boolean;
}

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  category,
  searchQuery,
  setSearchQuery,
  filteredExercises,
  onAddExercise,
  loading
}) => {
  return (
    <div className="space-y-6 pb-20">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} strokeWidth={2.5} />
        </div>
        <input
          id="exercise-search"
          type="text"
          placeholder={`Search ${category || 'all'} exercises...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
        />
      </div>

      <div className="space-y-4">
        <header className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Available Exercises</h3>
        </header>

        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Library...</p>
            </div>
          ) : filteredExercises.length > 0 ? (
            filteredExercises.map((exercise) => (
              <ExerciseCard 
                key={exercise.id} 
                exercise={exercise} 
                onAdd={onAddExercise} 
              />
            ))
          ) : (
            <div className="text-center py-20 px-6 bg-white rounded-3xl border border-dashed border-slate-200">
              <p className="text-sm font-bold text-slate-500">No exercises found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
