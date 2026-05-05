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

  return { history, loading };
};
