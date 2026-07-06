import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useExercises } from '../../../hooks/useExercises';
import { useWorkoutHistory } from '../../../hooks/useWorkoutHistory';
import { useWorkoutContext } from '../context/WorkoutSessionContext';
import { Exercise, Workout } from '../../../types';

export type ViewState = 'SETUP' | 'ACTIVE_SESSION' | 'SELECT_CATEGORY' | 'SELECT_EXERCISE' | 'SUMMARY';

export const useWorkoutFlow = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const { exercises, loading, addExercise: createExercise, updateExercise, deleteExercise, uploadThumbnail } = useExercises();
  const { history: workoutHistory } = useWorkoutHistory(100);
  const { activeExercises, addExercise, finishWorkout, clearSession } = useWorkoutContext();

  const exerciseFrequency = useMemo(() => {
    const counts: Record<string, number> = {};
    workoutHistory.forEach(workout => {
      workout.exercises.forEach(ex => {
        if (ex.exerciseId) {
          counts[ex.exerciseId] = (counts[ex.exerciseId] || 0) + 1;
        }
      });
    });
    return counts;
  }, [workoutHistory]);

  const [viewState, setViewState] = useState<ViewState>(() => {
    if (activeExercises.length > 0) return 'ACTIVE_SESSION';
    if (mode === 'manual') return 'SETUP';
    return 'SELECT_CATEGORY';
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [finishedWorkout, setFinishedWorkout] = useState<Workout | null>(null);

  const filteredExercises = useMemo(() => {
    return exercises
      .filter(ex => {
        const matchesCategory = !selectedCategory || ex.category === selectedCategory;
        const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        const freqA = a.id ? (exerciseFrequency[a.id] || 0) : 0;
        const freqB = b.id ? (exerciseFrequency[b.id] || 0) : 0;
        return freqB - freqA;
      });
  }, [exercises, selectedCategory, searchQuery, exerciseFrequency]);

  const handleAddExercise = async (exercise: Exercise) => {
    await addExercise(exercise);
    setViewState('ACTIVE_SESSION');
    setSearchQuery('');
  };

  const handleFinish = async () => {
    try {
      const result = await finishWorkout();
      if (result) {
        setFinishedWorkout(result);
        setViewState('SUMMARY');
      } else {
        navigate('/');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleBack = () => {
    if (viewState === 'SETUP') {
      if (activeExercises.length === 0) {
        clearSession();
      }
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
    finishedWorkout,
    createExercise,
    updateExercise,
    deleteExercise,
    uploadThumbnail
  };
};
