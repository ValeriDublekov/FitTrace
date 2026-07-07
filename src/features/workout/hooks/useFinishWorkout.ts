import { useState, useCallback } from 'react';
import { Workout, WorkoutExercise } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';
import { workoutService } from '../../../services/workoutService';

interface UseFinishWorkoutParams {
  activeExercises: WorkoutExercise[];
  workoutNotes: string;
  workoutDate: Date;
  workoutStartedAt: Date | null;
  sessionMode: 'LIVE' | 'MANUAL';
  clearSession: () => void;
}

export const useFinishWorkout = ({
  activeExercises,
  workoutNotes,
  workoutDate,
  workoutStartedAt,
  sessionMode,
  clearSession,
}: UseFinishWorkoutParams) => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

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
        durationSeconds: workoutStartedAt
          ? Math.floor((now.getTime() - workoutStartedAt.getTime()) / 1000)
          : undefined,
        exercises: activeExercises
          .map((ex) => {
            const filteredSets = ex.sets.filter((s) => {
              const hasData =
                (s.reps ?? 0) > 0 ||
                (s.weight ?? 0) > 0 ||
                (s.level ?? 0) > 0 ||
                (s.duration ?? 0) > 0;
              if (sessionMode === 'LIVE') return s.isCompleted && hasData;
              return hasData;
            });
            return {
              ...ex,
              sets: filteredSets,
              durationSeconds: ex.startedAt
                ? Math.floor((now.getTime() - new Date(ex.startedAt).getTime()) / 1000)
                : undefined,
            };
          })
          .filter((ex) => ex.sets.length > 0),
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
  }, [
    user,
    activeExercises,
    workoutNotes,
    workoutDate,
    workoutStartedAt,
    sessionMode,
    clearSession,
  ]);

  return {
    finishWorkout,
    isSaving,
  };
};
