import { useExercisesContext } from '../context/AppDataContext';
import { Exercise } from '../types';

export const useExercises = (options: { adminMode?: boolean } = {}) => {
  const {
    visibleExercises,
    globalExercises,
    loading,
    error,
    addExercise,
    updateExercise,
    deleteExercise,
    uploadThumbnail,
    mergeCustomExercise,
    refreshExercises,
  } = useExercisesContext();

  const wrapAddExercise = (exercise: Omit<Exercise, 'id' | 'createdAt'>) => 
    addExercise(exercise, options.adminMode);

  const wrapUpdateExercise = (id: string, exercise: Partial<Omit<Exercise, 'id' | 'createdAt'>>) => 
    updateExercise(id, exercise, options.adminMode);

  return {
    exercises: options.adminMode ? globalExercises : visibleExercises,
    loading,
    error,
    addExercise: wrapAddExercise,
    updateExercise: wrapUpdateExercise,
    deleteExercise,
    uploadThumbnail,
    mergeCustomExercise,
    refresh: refreshExercises,
  };
};
