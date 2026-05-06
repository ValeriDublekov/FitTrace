import React, { useState } from 'react';
import { Search, Plus, ListFilter, CheckCircle2 } from 'lucide-react';
import { Exercise } from '../../../types';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseForm } from '../../admin/components/ExerciseForm';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';

interface ExerciseSelectorProps {
  category: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredExercises: Exercise[];
  onAddExercise: (exercise: Exercise) => void;
  onAddCustomExercise: (data: Omit<Exercise, 'id' | 'createdAt'>) => Promise<string>;
  onUpdateCustomExercise: (id: string, data: Partial<Omit<Exercise, 'id' | 'createdAt'>>) => Promise<void>;
  onDeleteCustomExercise: (id: string) => Promise<void>;
  uploadThumbnail: (file: File) => Promise<string>;
  onFinishWorkout?: () => void;
  onChangeCategory?: () => void;
  loading: boolean;
}

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  category,
  searchQuery,
  setSearchQuery,
  filteredExercises,
  onAddExercise,
  onAddCustomExercise,
  onUpdateCustomExercise,
  onDeleteCustomExercise,
  uploadThumbnail,
  onFinishWorkout,
  onChangeCategory,
  loading
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);

  const handleDeleteConfirm = async () => {
    if (exerciseToDelete?.id) {
      await onDeleteCustomExercise(exerciseToDelete.id);
      setExerciseToDelete(null);
    }
  };

  if (showCreateForm || editingExercise) {
    return (
      <ExerciseForm 
        exercise={editingExercise || undefined}
        onSubmit={async (data) => {
          if (editingExercise?.id) {
            await onUpdateCustomExercise(editingExercise.id, data);
          } else {
            await onAddCustomExercise(data);
          }
          setShowCreateForm(false);
          setEditingExercise(null);
        }}
        onCancel={() => {
          setShowCreateForm(false);
          setEditingExercise(null);
        }}
        uploadThumbnail={uploadThumbnail}
      />
    );
  }

  return (
    <div className="space-y-6 pb-32">
      <div className="flex flex-wrap gap-3 mb-2">
        {onChangeCategory && (
          <button
            onClick={onChangeCategory}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <ListFilter size={14} />
            Change Category
          </button>
        )}
        {onFinishWorkout && (
          <button
            onClick={onFinishWorkout}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <CheckCircle2 size={14} />
            Finish Workout
          </button>
        )}
      </div>

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
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 hover:text-indigo-700"
          >
            <Plus size={12} />
            Add Custom
          </button>
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
                onEdit={setEditingExercise}
                onDelete={setExerciseToDelete}
              />
            ))
          ) : (
            <div className="text-center py-20 px-6 bg-white rounded-3xl border border-dashed border-slate-200">
              <p className="text-sm font-bold text-slate-500">No exercises found.</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={exerciseToDelete !== null}
        title="Delete Custom Exercise"
        message={`Are you sure you want to delete "${exerciseToDelete?.name}"? this will remove it from your custom exercise list.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setExerciseToDelete(null)}
      />
    </div>
  );
};
