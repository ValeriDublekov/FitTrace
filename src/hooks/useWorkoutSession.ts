import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Workout, PersistedWorkout, WorkoutExercise, ExerciseSet, Exercise, PersistedExercise } from '../types';
import { useAuth } from './useAuth';
import { workoutService } from '../services/workoutService';
import { useWorkoutRestTimer } from '../features/workout/hooks/useWorkoutRestTimer';
import {
  getPersistedExercises,
  getPersistedNotes,
  getPersistedDate,
  getPersistedStartedAt,
  getPersistedSessionMode,
  clearPersistedSession,
  useWorkoutSessionPersistence
} from '../features/workout/hooks/useWorkoutSessionPersistence';

export const useWorkoutSession = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [activeExercises, setActiveExercises] = useState<WorkoutExercise[]>(() => getPersistedExercises());
  const [workoutNotes, setWorkoutNotes] = useState(() => getPersistedNotes());
  const [workoutDate, setWorkoutDate] = useState<Date>(() => getPersistedDate());
  const [workoutStartedAt, setWorkoutStartedAt] = useState<Date | null>(() => getPersistedStartedAt());
  
  const urlMode = searchParams.get('mode') === 'manual' ? 'MANUAL' : 'LIVE';
  const [sessionMode, setSessionMode] = useState<'LIVE' | 'MANUAL'>(() => getPersistedSessionMode(urlMode));

  useEffect(() => {
    // If the mode in URL changes and we don't have active exercises, update session mode
    const urlMode = searchParams.get('mode') === 'manual' ? 'MANUAL' : 'LIVE';
    if (activeExercises.length === 0 && sessionMode !== urlMode) {
      setSessionMode(urlMode);
      if (urlMode === 'LIVE') {
        setWorkoutDate(new Date());
      }
    }
  }, [searchParams, activeExercises.length, sessionMode]);

  const { restTimer, startRestTimer, clearRestTimer } = useWorkoutRestTimer(sessionMode);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  const hasActiveSession = activeExercises.length > 0;
  const isActiveLive = hasActiveSession && sessionMode === 'LIVE';
  const isActiveManual = hasActiveSession && sessionMode === 'MANUAL';

  // Persistence to localStorage handled by the extracted hook
  useWorkoutSessionPersistence(
    activeExercises,
    workoutNotes,
    workoutDate,
    workoutStartedAt,
    sessionMode
  );

  const addExercise = useCallback(async (exercise: PersistedExercise) => {
    if (!user) return;

    const currentSessionInstance = [...activeExercises]
      .reverse()
      .find(ex => ex.exerciseId === exercise.id);

    let baseSets: ExerciseSet[] = [];

    if (currentSessionInstance) {
      baseSets = currentSessionInstance.sets;
    } else {
      const lastHistoricalSession = await workoutService.getLastExerciseSession(exercise.id, user.uid);
      baseSets = lastHistoricalSession?.sets || [];
    }

    const instanceId = `ex_idx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    if (activeExercises.length === 0) {
      const now = new Date();
      setWorkoutStartedAt(now);
      if (sessionMode === 'LIVE') {
        setWorkoutDate(now);
      }
    }

    const newExercise: WorkoutExercise = {
      id: instanceId,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      affectedPart: exercise.affectedPart,
      startedAt: new Date(),
      sets: Array.from({ length: 1 }, (_, i) => {
        const prevSet = baseSets[baseSets.length - 1]; 
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
    clearPersistedSession();
  }, []);

  const startWorkoutFromTemplate = useCallback(async (exercises: PersistedExercise[], mode: 'LIVE' | 'MANUAL') => {
    if (!user) return;
    clearSession();
    
    const now = new Date();
    setWorkoutStartedAt(now);
    setWorkoutDate(now);
    setSessionMode(mode);

    const initialExercises: WorkoutExercise[] = [];
    
    for (const ex of exercises) {
      const lastHistoricalSession = await workoutService.getLastExerciseSession(ex.id, user.uid);
      const baseSets = lastHistoricalSession?.sets || [];
      const instanceId = `ex_idx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${ex.id}`;
      
      initialExercises.push({
        id: instanceId,
        exerciseId: ex.id,
        exerciseName: ex.name,
        affectedPart: ex.affectedPart,
        startedAt: now,
        sets: Array.from({ length: 1 }, (_, i) => {
          const prevSet = baseSets[baseSets.length - 1]; 
          return {
            setIndex: i + 1,
            reps: prevSet?.reps ?? 10,
            weight: prevSet?.weight ?? 0,
            level: prevSet?.level ?? 0,
            duration: prevSet?.duration ?? 0,
            isCompleted: mode === 'MANUAL'
          };
        })
      });
    }

    setActiveExercises(initialExercises);
    if (initialExercises.length > 0) {
      setExpandedExerciseId(initialExercises[0].id);
    }
  }, [user, clearSession, setExpandedExerciseId]);

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
      const finishedWorkout = { ...workout };
      clearSession();
      return finishedWorkout;
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

  const updateExerciseNotes = useCallback((id: string, notes: string) => {
    setActiveExercises((prev) => prev.map(ex => {
      if (ex.id !== id) return ex;
      return { ...ex, sessionNotes: notes };
    }));
  }, []);

  const combineExercises = useCallback(async (selectedItems: { id?: string; exerciseId: string; rawExercise?: PersistedExercise }[]) => {
    if (!user) return;
    
    const groupId = `ss_${Date.now()}`;
    const resolvedExercises: WorkoutExercise[] = [];
    
    for (const item of selectedItems) {
      if (item.id) {
        const existing = activeExercises.find(ex => ex.id === item.id);
        if (existing) {
          resolvedExercises.push({
            ...existing,
            supersetGroupId: groupId
          });
        }
      } else if (item.rawExercise) {
        const exercise = item.rawExercise;
        
        const currentSessionInstance = [...activeExercises]
          .reverse()
          .find(ex => ex.exerciseId === exercise.id);

        let baseSets: ExerciseSet[] = [];

        if (currentSessionInstance) {
          baseSets = currentSessionInstance.sets;
        } else {
          const lastHistoricalSession = await workoutService.getLastExerciseSession(exercise.id, user.uid);
          baseSets = lastHistoricalSession?.sets || [];
        }

        const instanceId = `ex_idx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        resolvedExercises.push({
          id: instanceId,
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          affectedPart: exercise.affectedPart,
          startedAt: new Date(),
          supersetGroupId: groupId,
          sets: Array.from({ length: 1 }, (_, i) => {
            const prevSet = baseSets[baseSets.length - 1]; 
            return {
              setIndex: i + 1,
              reps: prevSet?.reps ?? 10,
              weight: prevSet?.weight ?? 0,
              level: prevSet?.level ?? 0,
              duration: prevSet?.duration ?? 0,
              isCompleted: sessionMode === 'MANUAL'
            };
          })
        });
      }
    }
    
    if (resolvedExercises.length < 2) return;
    
    // Determine max sets
    const maxSetsCount = Math.max(...resolvedExercises.map(ex => ex.sets.length), 1);
    
    const normalizedExercises = resolvedExercises.map(ex => {
      let updatedSets = [...ex.sets];
      while (updatedSets.length < maxSetsCount) {
        const lastSet = updatedSets[updatedSets.length - 1];
        updatedSets.push({
          setIndex: updatedSets.length + 1,
          reps: lastSet?.reps ?? 10,
          weight: lastSet?.weight ?? 0,
          level: lastSet?.level ?? 0,
          duration: lastSet?.duration ?? 0,
          isCompleted: sessionMode === 'MANUAL'
        });
      }
      return { 
        ...ex, 
        sets: updatedSets 
      };
    });
    
    setActiveExercises((prev) => {
      const existingIdsToRemove = selectedItems.filter(item => item.id).map(item => item.id);
      
      let insertIndex = prev.findIndex(ex => existingIdsToRemove.includes(ex.id));
      if (insertIndex === -1) {
        insertIndex = prev.length;
      }
      
      const before = prev.filter(ex => !existingIdsToRemove.includes(ex.id));
      
      const nextExercises = [
        ...before.slice(0, insertIndex),
        ...normalizedExercises,
        ...before.slice(insertIndex)
      ];
      
      return nextExercises;
    });
    
    setExpandedExerciseId(groupId);
    
    if (activeExercises.length === 0) {
      const now = new Date();
      setWorkoutStartedAt(now);
      if (sessionMode === 'LIVE') {
        setWorkoutDate(now);
      }
    }
  }, [user, activeExercises, sessionMode, setExpandedExerciseId]);

  const uncombineSuperset = useCallback((groupId: string) => {
    setActiveExercises((prev) => {
      return prev.map(ex => {
        if (ex.supersetGroupId === groupId) {
          const { supersetGroupId, ...rest } = ex;
          return rest as WorkoutExercise;
        }
        return ex;
      });
    });
  }, []);

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
    clearRestTimer,
    updateExerciseNotes,
    hasActiveSession,
    isActiveLive,
    isActiveManual,
    clearSession,
    startWorkoutFromTemplate,
    combineExercises,
    uncombineSuperset
  };
};
