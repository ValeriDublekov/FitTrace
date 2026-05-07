import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useExercises } from '../../../hooks/useExercises';
import { useWorkoutContext } from '../context/WorkoutSessionContext';
import { Exercise } from '../../../types';

export type ViewState = 'SETUP' | 'ACTIVE_SESSION' | 'SELECT_CATEGORY' | 'SELECT_EXERCISE';

export const useWorkoutFlow = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const { exercises, loading, addExercise: createExercise, updateExercise, deleteExercise, uploadThumbnail } = useExercises();
  const { activeExercises, addExercise, finishWorkout } = useWorkoutContext();

  const [viewState, setViewState] = useState<ViewState>(() => {
    if (activeExercises.length > 0) return 'ACTIVE_SESSION';
    if (mode === 'manual') return 'SETUP';
    return 'SELECT_CATEGORY';
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => {
      const matchesCategory = !selectedCategory || ex.category === selectedCategory;
      const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [exercises, selectedCategory, searchQuery]);

  const handleAddExercise = async (exercise: Exercise) => {
    await addExercise(exercise);
    setViewState('ACTIVE_SESSION');
    setSearchQuery('');
  };

  const handleFinish = async () => {
    try {
      await finishWorkout();
      navigate('/');
    } catch (error) {
      throw error;
    }
  };

  const handleBack = () => {
    if (viewState === 'SETUP') {
      navigate('/');
    } else if (viewState === 'SELECT_CATEGORY') {
      if (activeExercises.length > 0) setViewState('ACTIVE_SESSION');
      else if (mode === 'manual') setViewState('SETUP');
      else navigate('/');
    } else if (viewState === 'SELECT_EXERCISE') {
      setViewState('SELECT_CATEGORY');
      setSelectedCategory(null);
    } else {
      navigate('/');
    }
  };

  return {
    viewState,
    setViewState,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    exercises,
    loading,
    filteredExercises,
    handleAddExercise,
    handleFinish,
    handleBack,
    activeExercises,
    createExercise,
    updateExercise,
    deleteExercise,
    uploadThumbnail
  };
};
