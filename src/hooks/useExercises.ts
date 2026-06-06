import { useAppData } from '../context/AppDataContext';
import { Exercise } from '../types';

export const useExercises = (options: { adminMode?: boolean } = {}) => {
  const {
    state,
    addExercise,
    updateExercise,
    deleteExercise,
    uploadThumbnail,
    mergeCustomExercise,
    refreshExercises,
  } = useAppData();

  const wrapAddExercise = (exercise: Omit<Exercise, 'id' | 'createdAt'>) => 
    addExercise(exercise, options.adminMode);

  const wrapUpdateExercise = (id: string, exercise: Partial<Omit<Exercise, 'id' | 'createdAt'>>) => 
    updateExercise(id, exercise, options.adminMode);

  return {
    exercises: options.adminMode ? state.globalExercises : state.visibleExercises,
    loading: state.loading.exercises,
    error: state.exercisesError,
    addExercise: wrapAddExercise,
    updateExercise: wrapUpdateExercise,
    deleteExercise,
    uploadThumbnail,
    mergeCustomExercise,
    refresh: refreshExercises,
  };
};
