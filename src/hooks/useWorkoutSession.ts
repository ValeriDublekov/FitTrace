import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Workout, WorkoutExercise, PersistedExercise } from '../types';
import { useAuth } from './useAuth';
import { workoutService } from '../services/workoutService';
import { useWorkoutRestTimer } from '../features/workout/hooks/useWorkoutRestTimer';
import { useWorkoutSessionMutations } from '../features/workout/hooks/useWorkoutSessionMutations';
import { useFinishWorkout } from '../features/workout/hooks/useFinishWorkout';
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

  const {
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
  } = useWorkoutSessionMutations({
    activeExercises,
    setActiveExercises,
    sessionMode,
    startRestTimer,
    expandedExerciseId,
    setExpandedExerciseId,
    setWorkoutStartedAt,
    setWorkoutDate,
  });

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

   const { finishWorkout, isSaving } = useFinishWorkout({
    activeExercises,
    workoutNotes,
    workoutDate,
    workoutStartedAt,
    sessionMode,
    clearSession,
  });

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
