import { useState, useEffect } from 'react';
import { workoutService } from '../services/workoutService';
import { Workout } from '../types';
import { useAuth } from './useAuth';

export const useExerciseHistory = (exerciseId: string | undefined) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!exerciseId || !user) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await workoutService.getExerciseHistory(exerciseId, user.uid);
        setHistory(data);
      } catch (error) {
        console.error('Error fetching exercise history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [exerciseId, user]);

  const deleteWorkout = async (workoutId: string) => {
    try {
      await workoutService.deleteWorkout(workoutId);
      setHistory(prev => prev.filter(w => w.id !== workoutId));
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw error;
    }
  };

  return { history, loading, deleteWorkout };
};
