import { useState, useCallback, useEffect } from 'react';
import { Workout, WorkoutExercise, ExerciseSet, Exercise } from '../types';
import { useAuth } from './useAuth';
import { workoutService } from '../services/workoutService';

export const useWorkoutSession = () => {
  const { user } = useAuth();
  const [activeExercises, setActiveExercises] = useState<WorkoutExercise[]>([]);
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [restTimer, setRestTimer] = useState<number | null>(null);

  // Rest timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (restTimer !== null && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
      }, 1000);
    } else if (restTimer === 0) {
      setRestTimer(null);
    }
    return () => clearInterval(interval);
  }, [restTimer]);

  const startRestTimer = useCallback((seconds: number = 60) => {
    setRestTimer(seconds);
  }, []);

  const addExercise = useCallback((exercise: Exercise) => {
    setActiveExercises((prev) => {
      // Check if already added
      if (prev.find(e => e.exerciseId === exercise.id)) return prev;

      const newExercise: WorkoutExercise = {
        exerciseId: exercise.id!,
        exerciseName: exercise.name,
        sets: Array.from({ length: 3 }, (_, i) => ({
          setIndex: i + 1,
          isCompleted: false
        }))
      };
      return [...prev, newExercise];
    });
  }, []);

  const updateSet = useCallback((exerciseId: string, setIndex: number, data: Partial<ExerciseSet>) => {
    setActiveExercises((prev) => prev.map(ex => {
      if (ex.exerciseId !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => {
          if (s.setIndex !== setIndex) return s;
          const updatedSet = { ...s, ...data };
          
          // If marking as completed for the first time, start timer
          if (data.isCompleted && !s.isCompleted) {
            startRestTimer();
          }
          
          return updatedSet;
        })
      };
    }));
  }, [startRestTimer]);

  const addSet = useCallback((exerciseId: string) => {
    setActiveExercises((prev) => prev.map(ex => {
      if (ex.exerciseId !== exerciseId) return ex;
      const nextIndex = ex.sets.length + 1;
      return {
        ...ex,
        sets: [...ex.sets, { setIndex: nextIndex, isCompleted: false }]
      };
    }));
  }, []);

  const removeSet = useCallback((exerciseId: string, setIndex: number) => {
    setActiveExercises((prev) => prev.map(ex => {
      if (ex.exerciseId !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.filter(s => s.setIndex !== setIndex).map((s, i) => ({ ...s, setIndex: i + 1 }))
      };
    }));
  }, []);

  const finishWorkout = useCallback(async () => {
    if (!user || activeExercises.length === 0) return;
    
    setIsSaving(true);
    try {
      const workout: Omit<Workout, 'id'> = {
        userId: user.uid,
        date: new Date(),
        notes: workoutNotes,
        exercises: activeExercises.map(ex => ({
          ...ex,
          sets: ex.sets.filter(s => s.isCompleted) // Only save completed sets
        })).filter(ex => ex.sets.length > 0) // Only save exercises with completed sets
      };

      if (workout.exercises.length === 0) {
        throw new Error('No sets completed');
      }

      await workoutService.saveWorkout(workout);
      setActiveExercises([]);
      setWorkoutNotes('');
      return true;
    } catch (error) {
      console.error('Error saving workout:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [user, activeExercises, workoutNotes]);

  return {
    activeExercises,
    workoutNotes,
    setWorkoutNotes,
    addExercise,
    updateSet,
    addSet,
    removeSet,
    finishWorkout,
    isSaving,
    restTimer,
    startRestTimer
  };
};
