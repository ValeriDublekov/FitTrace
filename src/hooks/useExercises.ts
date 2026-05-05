import { useState, useEffect, useCallback } from 'react';
import { Exercise } from '../types';
import { exerciseService } from '../services/exerciseService';

export const useExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    try {
      const data = await exerciseService.getExercises();
      setExercises(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch exercises');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const addExercise = async (exercise: Omit<Exercise, 'id' | 'createdAt'>) => {
    try {
      const id = await exerciseService.createExercise(exercise);
      await fetchExercises();
      return id;
    } catch (err) {
      setError('Failed to add exercise');
      throw err;
    }
  };

  const updateExercise = async (id: string, exercise: Partial<Omit<Exercise, 'id' | 'createdAt'>>) => {
    try {
      await exerciseService.updateExercise(id, exercise);
      await fetchExercises();
    } catch (err) {
      setError('Failed to update exercise');
      throw err;
    }
  };

  const uploadThumbnail = async (file: File) => {
    try {
      return await exerciseService.uploadThumbnail(file);
    } catch (err) {
      setError('Failed to upload image');
      throw err;
    }
  };

  return {
    exercises,
    loading,
    error,
    addExercise,
    updateExercise,
    uploadThumbnail,
    refresh: fetchExercises
  };
};
