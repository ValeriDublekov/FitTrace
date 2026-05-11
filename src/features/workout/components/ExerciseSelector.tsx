import React, { useState } from 'react';
import { Search, Plus, ListFilter, CheckCircle2, Dumbbell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Exercise } from '../../../types';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseForm } from '../../admin/components/ExerciseForm';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { useWorkoutContext } from '../context/WorkoutSessionContext';

interface ExerciseSelectorProps {
  category: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredExercises: Exercise[];
  onAddExercise: (exercise: Exercise) => void;
  onAddCustomExercise: (data: Omit<Exercise, 'id' | 'createdAt'>) => Promise<string>;
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
  uploadThumbnail,
  onFinishWorkout,
  onChangeCategory,
  loading
}) => {
  const { t } = useTranslation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const { activeExercises } = useWorkoutContext();
  const completedExercises = activeExercises.filter(ex => ex.sets.some(s => s.isCompleted));

  if (showCreateForm) {
    return (
      <ExerciseForm 
        defaultCategory={category || undefined}
        onSubmit={async (data) => {
          const newId = await onAddCustomExercise(data);
          // Automatically add the new exercise to the session and go to ACTIVE_SESSION (handled by onAddExercise)
          onAddExercise({
            ...data,
            id: newId,
            createdAt: new Date()
          });
          setShowCreateForm(false);
        }}
        onCancel={() => {
          setShowCreateForm(false);
        }}
        uploadThumbnail={uploadThumbnail}
      />
    );
  }

  return (
    <div className="space-y-6 pb-32">
      <div className="flex flex-wrap gap-3 mb-2">
        {onChangeCategory && (
          <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-w-0">
            <div className="flex-1 px-4 py-3 flex flex-col justify-center min-w-0 leading-tight">
              <span className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-400 truncate">
                {t('workout.titles.select_category')}
              </span>
              <span className="text-[10px] font-bold text-indigo-600 truncate uppercase mt-0.5">
                {category ? t(`workout.categories.${category.toLowerCase().replace(' ', '_')}`) : t('workout.categories.all')}
              </span>
            </div>
            <button
              onClick={onChangeCategory}
              className="px-4 py-3 bg-slate-50 border-l border-slate-100 text-slate-600 hover:text-indigo-600 transition-colors flex items-center shrink-0 active:bg-slate-100"
            >
              <ListFilter size={16} strokeWidth={2.5} />
            </button>
          </div>
        )}
        {onFinishWorkout && (
          <button
            onClick={() => setShowConfirmFinish(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
          >
            <CheckCircle2 size={16} strokeWidth={2.5} />
            {t('workout.finish_workout')}
          </button>
        )}
      </div>

      {completedExercises.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Completed Exercises</h3>
          <div className="flex flex-wrap gap-2">
            {completedExercises.map(ex => (
              <span key={ex.id} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold">
                <Dumbbell size={12} />
                {ex.exerciseName}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} strokeWidth={2.5} />
        </div>
        <input
          id="exercise-search"
          type="text"
          placeholder={`${t('workout.progress.search')} ${category ? `(${t(`workout.categories.${category.toLowerCase().replace(' ', '_')}`)})` : ''}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
        />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between [.font-size-large_&]:flex-col [.font-size-xlarge_&]:flex-col">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 [.font-size-large_&]:hidden [.font-size-xlarge_&]:hidden">
            {t('workout.available_exercises')}
          </h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 w-full sm:w-auto"
          >
            <Plus size={16} strokeWidth={3} />
            {t('workout.add_custom')}
          </button>
        </div>
        
        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('common.loading')}</p>
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
              <p className="text-sm font-bold text-slate-500">{t('workout.progress.no_history')}</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmFinish}
        title={t('workout.finish_workout')}
        message={t('workout.confirmations.finish_workout.message')}
        confirmLabel={t('workout.finish_workout')}
        onConfirm={onFinishWorkout || (() => {})}
        onCancel={() => {
          setShowConfirmFinish(false);
        }}
      />
    </div>
  );
};
