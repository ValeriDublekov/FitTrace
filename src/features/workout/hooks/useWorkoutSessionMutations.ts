import { useCallback, Dispatch, SetStateAction } from 'react';
import { WorkoutExercise, ExerciseSet, PersistedExercise } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';
import { workoutService } from '../../../services/workoutService';

interface UseWorkoutSessionMutationsParams {
  activeExercises: WorkoutExercise[];
  setActiveExercises: Dispatch<SetStateAction<WorkoutExercise[]>>;
  sessionMode: 'LIVE' | 'MANUAL';
  startRestTimer: () => void;
  expandedExerciseId: string | null;
  setExpandedExerciseId: (id: string | null) => void;
  setWorkoutStartedAt: Dispatch<SetStateAction<Date | null>>;
  setWorkoutDate: Dispatch<SetStateAction<Date>>;
}

export const useWorkoutSessionMutations = ({
  activeExercises,
  setActiveExercises,
  sessionMode,
  startRestTimer,
  expandedExerciseId,
  setExpandedExerciseId,
  setWorkoutStartedAt,
  setWorkoutDate,
}: UseWorkoutSessionMutationsParams) => {
  const { user } = useAuth();

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
  }, [sessionMode, user, activeExercises, setWorkoutStartedAt, setWorkoutDate, setActiveExercises, setExpandedExerciseId]);

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
  }, [startRestTimer, sessionMode, setActiveExercises]);

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
  }, [sessionMode, setActiveExercises]);

  const removeSet = useCallback((id: string, setIndex: number) => {
    setActiveExercises((prev) => prev.map(ex => {
      if (ex.id !== id) return ex;
      return {
        ...ex,
        sets: ex.sets.filter(s => s.setIndex !== setIndex).map((s, i) => ({ ...s, setIndex: i + 1 }))
      };
    }));
  }, [setActiveExercises]);

  const removeExercise = useCallback((id: string) => {
    setActiveExercises((prev) => prev.filter(ex => ex.id !== id));
    if (expandedExerciseId === id) {
      setExpandedExerciseId(null);
    }
  }, [expandedExerciseId, setActiveExercises, setExpandedExerciseId]);

  const markExerciseAsCompleted = useCallback((id: string) => {
    setActiveExercises((prev) => prev.map(ex => {
      if (ex.id !== id) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => ({ ...s, isCompleted: true }))
      };
    }));
  }, [setActiveExercises]);

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
  }, [setActiveExercises]);

  const updateExerciseNotes = useCallback((id: string, notes: string) => {
    setActiveExercises((prev) => prev.map(ex => {
      if (ex.id !== id) return ex;
      return { ...ex, sessionNotes: notes };
    }));
  }, [setActiveExercises]);

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
  }, [user, activeExercises, sessionMode, setExpandedExerciseId, setWorkoutStartedAt, setWorkoutDate, setActiveExercises]);

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
  }, [setActiveExercises]);

  return {
    addExercise,
    updateSet,
    addSet,
    removeSet,
    removeExercise,
    markExerciseAsCompleted,
    removeIncompleteSets,
    updateExerciseNotes,
    combineExercises,
    uncombineSuperset,
  };
};
