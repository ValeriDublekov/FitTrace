import { useState, useEffect, useCallback } from 'react';
import { Exercise } from '../types';
import { exerciseService } from '../services/exerciseService';
import { useAuth } from './useAuth';

export const useExercises = (options: { adminMode?: boolean } = {}) => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    try {
      const data = await exerciseService.getExercises(options.adminMode ? undefined : user?.uid);
      setExercises(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch exercises');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, options.adminMode]);

  useEffect(() => {
    // Only fetch if not loading auth or we are in admin mode
    fetchExercises();
  }, [fetchExercises]);

  const addExercise = async (exercise: Omit<Exercise, 'id' | 'createdAt'>) => {
    try {
      const exerciseData: any = {
        ...exercise,
        isCustom: !options.adminMode
      };

      if (!options.adminMode && user?.uid) {
        exerciseData.userId = user.uid;
      }

      const id = await exerciseService.createExercise(exerciseData);
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

  const deleteExercise = async (id: string) => {
    try {
      await exerciseService.deleteExercise(id);
      await fetchExercises();
    } catch (err) {
      setError('Failed to delete exercise');
      throw err;
    }
  };

  return {
    exercises,
    loading,
    error,
    addExercise,
    updateExercise,
    deleteExercise,
    uploadThumbnail,
    refresh: fetchExercises
  };
};
