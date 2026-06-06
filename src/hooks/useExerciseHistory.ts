import { useMemo } from 'react';
import { useWorkoutHistoryStore } from './useWorkoutHistory';

export const useExerciseHistory = (exerciseId: string | undefined) => {
  const { workouts, loading, deleteWorkout } = useWorkoutHistoryStore();

  const history = useMemo(() => {
    if (!exerciseId) return [];
    return workouts.filter(workout =>
      workout.exercises.some(ex => ex.exerciseId === exerciseId)
    );
  }, [workouts, exerciseId]);

  return { history, loading: loading, deleteWorkout };
};
