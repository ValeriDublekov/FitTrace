import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Workout, PersistedWorkout, WorkoutExercise, Exercise, PersistedExercise, ExerciseSet, normalizeSets } from '../../types';
import { X, Calendar, Plus, Trash2, Save, Dumbbell, ChevronRight, ArrowLeft } from 'lucide-react';
import { workoutService } from '../../services/workoutService';
import { useExercises } from '../../hooks/useExercises';
import { v4 as uuidv4 } from 'uuid';

interface EditWorkoutModalProps {
  workout: PersistedWorkout;
  onClose: () => void;
  onSave: (updatedWorkout: PersistedWorkout) => void;
}

export const EditWorkoutModal: React.FC<EditWorkoutModalProps> = ({ workout, onClose, onSave }) => {
  const { t } = useTranslation();
  const { exercises: allExercises, loading: exercisesLoading } = useExercises();
  const [editedDate, setEditedDate] = useState<string>(
    workout.date.toISOString().split('T')[0]
  );
  const [editedExercises, setEditedExercises] = useState<WorkoutExercise[]>(() => {
    return structuredClone(workout.exercises).map(ex => ({
      ...ex,
      sets: normalizeSets(ex.sets),
    }));
  });
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleRemoveExercise = (index: number) => {
    setEditedExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddExercise = (exercise: PersistedExercise) => {
    const newWorkoutExercise: WorkoutExercise = {
      id: uuidv4(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      affectedPart: exercise.affectedPart,
      sets: [
        { setIndex: 1, isCompleted: true }
      ]
    };
    setEditedExercises(prev => [...prev, newWorkoutExercise]);
    setShowExerciseSelector(false);
  };

  const handleUpdateSet = (exerciseIndex: number, setIndex: number, updates: Partial<ExerciseSet>) => {
    const newExercises = [...editedExercises];
    newExercises[exerciseIndex].sets[setIndex] = {
      ...newExercises[exerciseIndex].sets[setIndex],
      ...updates
    };
    setEditedExercises(newExercises);
  };

  const handleAddSet = (exerciseIndex: number) => {
    const newExercises = [...editedExercises];
    const sets = newExercises[exerciseIndex].sets;
    const lastSet = sets[sets.length - 1];
    
    newExercises[exerciseIndex].sets.push({
      setIndex: sets.length + 1,
      weight: lastSet?.weight,
      reps: lastSet?.reps,
      level: lastSet?.level,
      isCompleted: true
    });
    setEditedExercises(newExercises);
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...editedExercises];
    newExercises[exerciseIndex].sets = normalizeSets(
      newExercises[exerciseIndex].sets.filter((_, i) => i !== setIndex)
    );
    setEditedExercises(newExercises);
  };

  const handleSave = async () => {
    if (!workout.id) return;
    setSaving(true);
    try {
      const normalizedExercises = editedExercises.map(ex => ({
        ...ex,
        sets: normalizeSets(ex.sets),
      }));

      const updatedWorkout: PersistedWorkout = {
        ...workout,
        date: new Date(editedDate),
        exercises: normalizedExercises,
      };

      await workoutService.updateWorkout(workout.id, {
        date: updatedWorkout.date,
        exercises: updatedWorkout.exercises
      });

      onSave(updatedWorkout);
      onClose();
    } catch (error) {
      console.error('Failed to update workout:', error);
      alert(t('workout.edit_workout.save_error'));
    } finally {
      setSaving(false);
    }
  };

  if (showExerciseSelector) {
    return (
      <div className="fixed inset-0 bg-white z-[60] flex flex-col p-6 overflow-y-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setShowExerciseSelector(false)} className="p-2 hover:bg-zinc-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-zinc-600" />
          </button>
          <h2 className="font-black text-2xl text-zinc-900">{t('workout.edit_workout.add_exercise')}</h2>
        </div>
        
        <div className="space-y-3">
          {exercisesLoading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            allExercises.map((ex) => (
              <button
                key={ex.id}
                onClick={() => handleAddExercise(ex)}
                className="w-full flex items-center justify-between p-4 bg-zinc-50 hover:bg-indigo-50 border border-zinc-100 hover:border-indigo-200 rounded-2xl transition-all group"
              >
                <div className="flex flex-col items-start px-1">
                  <span className="font-bold text-zinc-900 group-hover:text-indigo-600 text-left">
                    {ex.name} {ex.affectedPart ? `(${ex.affectedPart})` : ''}
                  </span>
                  <span className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">{t(`workout.categories.${ex.category.toLowerCase().replace(' ', '_')}`)}</span>
                </div>
                <div className="bg-white p-2 rounded-xl text-zinc-400 group-hover:text-indigo-600 group-hover:bg-white shadow-sm">
                  <ChevronRight size={18} strokeWidth={3} />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-white">
          <h2 className="font-black text-xl text-zinc-900">{t('workout.edit_workout.title')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Date Picker Section */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              <Calendar size={14} />
              {t('workout.edit_workout.change_date')}
            </label>
            <input 
              type="date" 
              value={editedDate}
              onChange={(e) => setEditedDate(e.target.value)}
              className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-zinc-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
            />
          </div>

          {/* Exercises Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                {t('workout.titles.exercises')}
              </label>
              <button
                onClick={() => setShowExerciseSelector(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
              >
                <Plus size={14} strokeWidth={3} />
                {t('workout.edit_workout.add_exercise')}
              </button>
            </div>

            <div className="space-y-8">
              {editedExercises.map((ex, exIdx) => (
                <div key={ex.id || exIdx} className="bg-zinc-50/50 p-5 rounded-[1.5rem] border border-zinc-100 space-y-4 relative group">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 font-black text-zinc-900">
                      <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                        <Dumbbell className="w-4 h-4" />
                      </div>
                      {ex.exerciseName} {ex.affectedPart ? `(${ex.affectedPart})` : ''}
                    </div>
                    <button 
                      onClick={() => handleRemoveExercise(exIdx)}
                      className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest px-2">
                      <div>SET</div>
                      <div>KG / LVL</div>
                      <div>REPS / T</div>
                      <div className="text-right">DEL</div>
                    </div>
                    
                    {ex.sets.map((set, setIdx) => {
                      const exerciseInfo = allExercises.find(a => a.id === ex.exerciseId);
                      const isWeight = exerciseInfo?.loadType === 'WEIGHT_REPS';
                      const isLevel = exerciseInfo?.loadType === 'LEVEL_REPS';
                      const isCardio = exerciseInfo?.loadType === 'CARDIO';

                      return (
                        <div key={setIdx} className="grid grid-cols-4 gap-2 items-center">
                          <div className="text-xs font-black text-zinc-400 text-center">{setIdx + 1}</div>
                          <input 
                            type="number"
                            value={set.weight ?? set.level ?? ''}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              if (isWeight) handleUpdateSet(exIdx, setIdx, { weight: val });
                              else if (isLevel || isCardio) handleUpdateSet(exIdx, setIdx, { level: val });
                            }}
                            className="bg-white border border-zinc-200 rounded-xl p-2 text-center text-sm font-bold text-zinc-900 focus:border-indigo-500 outline-none"
                          />
                          <input 
                            type="number"
                            value={set.reps ?? set.duration ?? ''}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              if (isCardio) handleUpdateSet(exIdx, setIdx, { duration: val });
                              else handleUpdateSet(exIdx, setIdx, { reps: val });
                            }}
                            className="bg-white border border-zinc-200 rounded-xl p-2 text-center text-sm font-bold text-zinc-900 focus:border-indigo-500 outline-none"
                          />
                          <div className="flex justify-end">
                            <button 
                              onClick={() => handleRemoveSet(exIdx, setIdx)}
                              className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    
                    <button
                      onClick={() => handleAddSet(exIdx)}
                      className="w-full py-2 border border-dashed border-zinc-300 rounded-xl text-[10px] font-black uppercase text-zinc-400 hover:text-indigo-600 hover:border-indigo-300 transition-all mt-2"
                    >
                      + {t('workout.add_set')}
                    </button>
                  </div>
                </div>
              ))}

              {editedExercises.length === 0 && (
                <div className="text-center py-12 px-6 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
                  <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">{t('workout.empty_session')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-zinc-100 bg-zinc-50/50">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:bg-zinc-300 disabled:shadow-none transition-all active:scale-95"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Save size={18} strokeWidth={2.5} />
                {t('common.save')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
