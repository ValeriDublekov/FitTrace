import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Workout, WorkoutExercise, ExerciseSet, Exercise } from '../types';
import { useAuth } from './useAuth';
import { workoutService } from '../services/workoutService';
import { STORAGE_KEYS } from '../constants';
import { useWorkoutRestTimer } from '../features/workout/hooks/useWorkoutRestTimer';

export const useWorkoutSession = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [activeExercises, setActiveExercises] = useState<WorkoutExercise[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_EXERCISES);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [workoutNotes, setWorkoutNotes] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.WORKOUT_NOTES) || '';
  });
  
  const [workoutDate, setWorkoutDate] = useState<Date>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WORKOUT_DATE);
    return saved ? new Date(saved) : new Date();
  });

  const [workoutStartedAt, setWorkoutStartedAt] = useState<Date | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WORKOUT_STARTED_AT);
    return saved ? new Date(saved) : null;
  });
  
  const initialMode = searchParams.get('mode') === 'manual' ? 'MANUAL' : 'LIVE';
  const [sessionMode, setSessionMode] = useState<'LIVE' | 'MANUAL'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSION_MODE);
    return (saved as 'LIVE' | 'MANUAL') || initialMode;
  });

  const { restTimer, startRestTimer, clearRestTimer } = useWorkoutRestTimer(sessionMode);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  // Persistence to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_EXERCISES, JSON.stringify(activeExercises));
  }, [activeExercises]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_NOTES, workoutNotes);
  }, [workoutNotes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_DATE, workoutDate.toISOString());
  }, [workoutDate]);

  useEffect(() => {
    if (workoutStartedAt) {
      localStorage.setItem(STORAGE_KEYS.WORKOUT_STARTED_AT, workoutStartedAt.toISOString());
    } else {
      localStorage.removeItem(STORAGE_KEYS.WORKOUT_STARTED_AT);
    }
  }, [workoutStartedAt]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSION_MODE, sessionMode);
  }, [sessionMode]);

  const addExercise = useCallback(async (exercise: Exercise) => {
    if (!user) return;

    const currentSessionInstance = [...activeExercises]
      .reverse()
      .find(ex => ex.exerciseId === exercise.id);

    let baseSets: ExerciseSet[] = [];

    if (currentSessionInstance) {
      baseSets = currentSessionInstance.sets;
    } else {
      const lastHistoricalSession = await workoutService.getLastExerciseSession(exercise.id!, user.uid);
      baseSets = lastHistoricalSession?.sets || [];
    }

    const instanceId = `ex_idx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    if (activeExercises.length === 0) {
      setWorkoutStartedAt(new Date());
    }

    const newExercise: WorkoutExercise = {
      id: instanceId,
      exerciseId: exercise.id!,
      exerciseName: exercise.name,
      startedAt: new Date(),
      sets: Array.from({ length: 1 }, (_, i) => {
        const prevSet = baseSets[i] || baseSets[baseSets.length - 1]; 
        return {
          setIndex: i + 1,
          reps: prevSet?.reps ?? 10,
          weight: prevSet?.weight ?? 0,
          level: prevSet?.level ?? 0,
          duration: prevSet?.duration ?? 0,
          isCompleted: sessionMode === 'MANUAL'
        };
      })
    };

    setActiveExercises((prev) => [...prev, newExercise]);
    setExpandedExerciseId(instanceId);
  }, [sessionMode, user, activeExercises]);

  const updateSet = useCallback((id: string, setIndex: number, data: Partial<ExerciseSet>) => {
    setActiveExercises((prev) => prev.map(ex => {
      if (ex.id !== id) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => {
          if (s.setIndex !== setIndex) return s;
          const updatedSet = { ...s, ...data };
          if (data.isCompleted && !s.isCompleted && sessionMode === 'LIVE') {
            startRestTimer();
          }
          return updatedSet;
        })
      };
    }));
  }, [startRestTimer, sessionMode]);

  const addSet = useCallback((id: string) => {
    setActiveExercises((prev) => prev.map(ex => {
      if (ex.id !== id) return ex;
      const nextIndex = ex.sets.length + 1;
      const lastSet = ex.sets[ex.sets.length - 1];
      return {
        ...ex,
        sets: [...ex.sets, { 
          setIndex: nextIndex, 
          reps: lastSet?.reps ?? 10,
          weight: lastSet?.weight ?? 0,
          level: lastSet?.level ?? 0,
          duration: lastSet?.duration ?? 0,
          isCompleted: sessionMode === 'MANUAL'
        }]
      };
    }));
  }, [sessionMode]);

  const removeSet = useCallback((id: string, setIndex: number) => {
    setActiveExercises((prev) => prev.map(ex => {
      if (ex.id !== id) return ex;
      return {
        ...ex,
        sets: ex.sets.filter(s => s.setIndex !== setIndex).map((s, i) => ({ ...s, setIndex: i + 1 }))
      };
    }));
  }, []);

  const markExerciseAsCompleted = useCallback((id: string) => {
    setActiveExercises((prev) => prev.map(ex => {
      if (ex.id !== id) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => ({ ...s, isCompleted: true }))
      };
    }));
  }, []);

  const removeIncompleteSets = useCallback((id: string) => {
    setActiveExercises((prev) => {
      const nextExercises = prev.map(ex => {
        if (ex.id !== id) return ex;
        const completedSets = ex.sets.filter(s => s.isCompleted);
        return {
          ...ex,
          sets: completedSets.map((s, i) => ({ ...s, setIndex: i + 1 }))
        };
      });
      return nextExercises.filter(ex => ex.id !== id || ex.sets.length > 0);
    });
  }, []);

  const clearSession = useCallback(() => {
    setActiveExercises([]);
    setWorkoutNotes('');
    setWorkoutDate(new Date());
    setWorkoutStartedAt(null);
    setSessionMode('LIVE');
    setExpandedExerciseId(null);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_EXERCISES);
    localStorage.removeItem(STORAGE_KEYS.WORKOUT_NOTES);
    localStorage.removeItem(STORAGE_KEYS.WORKOUT_DATE);
    localStorage.removeItem(STORAGE_KEYS.WORKOUT_STARTED_AT);
    localStorage.removeItem(STORAGE_KEYS.SESSION_MODE);
  }, []);

  const finishWorkout = useCallback(async () => {
    if (!user || activeExercises.length === 0) return;
    setIsSaving(true);
    try {
      const now = new Date();
      const workout: Omit<Workout, 'id'> = {
        userId: user.uid,
        date: workoutDate,
        notes: workoutNotes,
        startedAt: workoutStartedAt || undefined,
        durationSeconds: workoutStartedAt ? Math.floor((now.getTime() - workoutStartedAt.getTime()) / 1000) : undefined,
        exercises: activeExercises.map(ex => {
          const filteredSets = ex.sets.filter(s => {
            const hasData = (s.reps ?? 0) > 0 || (s.weight ?? 0) > 0 || (s.level ?? 0) > 0 || (s.duration ?? 0) > 0;
            if (sessionMode === 'LIVE') return s.isCompleted && hasData;
            return hasData;
          });
          return { 
            ...ex, 
            sets: filteredSets,
            durationSeconds: ex.startedAt ? Math.floor((now.getTime() - new Date(ex.startedAt).getTime()) / 1000) : undefined
          };
        }).filter(ex => ex.sets.length > 0)
      };

      if (workout.exercises.length > 0) {
        await workoutService.saveWorkout(workout);
      }
      clearSession();
      return true;
    } catch (error) {
      console.error('Error saving workout:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [user, activeExercises, workoutNotes, workoutDate, workoutStartedAt, sessionMode, clearSession]);

  const removeExercise = useCallback((id: string) => {
    setActiveExercises((prev) => prev.filter(ex => ex.id !== id));
    if (expandedExerciseId === id) {
      setExpandedExerciseId(null);
    }
  }, [expandedExerciseId]);

  return {
    activeExercises,
    workoutNotes,
    setWorkoutNotes,
    workoutDate,
    setWorkoutDate,
    sessionMode,
    setSessionMode,
    addExercise,
    removeExercise,
    updateSet,
    addSet,
    removeSet,
    finishWorkout,
    markExerciseAsCompleted,
    removeIncompleteSets,
    isSaving,
    restTimer,
    expandedExerciseId,
    setExpandedExerciseId,
    startRestTimer,
    clearRestTimer
  };
};
