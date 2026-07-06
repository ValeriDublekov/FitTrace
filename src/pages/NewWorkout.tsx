import React from 'react';
import { WorkoutLayout } from '../components/layout/WorkoutLayout';
import { CategorySelector } from '../features/workout/components/CategorySelector';
import { ExerciseSelector } from '../features/workout/components/ExerciseSelector';
import { ActiveSession } from '../features/workout/components/ActiveSession';
import { WorkoutSummary } from '../features/workout/components/WorkoutSummary';
import { WorkoutSessionProvider } from '../features/workout/context/WorkoutSessionContext';
import { useWorkoutFlow } from '../features/workout/hooks/useWorkoutFlow';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { WorkoutSetup } from '../features/workout/components/WorkoutSetup';

const NewWorkoutContent: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    viewState,
    setViewState,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    loading,
    filteredExercises,
    handleAddExercise,
    handleFinish,
    handleBack,
    finishedWorkout,
    createExercise,
    updateExercise,
    deleteExercise,
    uploadThumbnail
  } = useWorkoutFlow();

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [viewState]);

  const getHeaderTitle = () => {
    if (viewState === 'SETUP') return t('workout.titles.new_workout');
    if (viewState === 'ACTIVE_SESSION') return t('workout.titles.active_session');
    if (viewState === 'SELECT_CATEGORY') return t('workout.titles.select_category');
    if (viewState === 'SUMMARY') return t('workout.session_finished');
    return selectedCategory || t('workout.titles.exercises');
  };

  return (
    <WorkoutLayout title={getHeaderTitle()} onBack={viewState === 'SUMMARY' ? undefined : handleBack}>
      {viewState === 'SETUP' && (
        <WorkoutSetup 
          onNext={() => setViewState('SELECT_CATEGORY')} 
        />
      )}
      
      {viewState === 'SELECT_CATEGORY' && (
        <CategorySelector 
          onSelect={(category) => {
            setSelectedCategory(category);
            setViewState('SELECT_EXERCISE');
          }} 
          onBack={handleBack}
        />
      )}
      
      {viewState === 'SELECT_EXERCISE' && (
        <ExerciseSelector
          category={selectedCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredExercises={filteredExercises}
          onAddExercise={handleAddExercise}
          onAddCustomExercise={createExercise}
          uploadThumbnail={uploadThumbnail}
          loading={loading}
          onFinishWorkout={handleFinish}
          onChangeCategory={() => {
            setSelectedCategory(null);
            setViewState('SELECT_CATEGORY');
          }}
        />
      )}

      {viewState === 'ACTIVE_SESSION' && (
        <ActiveSession 
          onAddClick={() => setViewState(selectedCategory ? 'SELECT_EXERCISE' : 'SELECT_CATEGORY')}
          onFinish={handleFinish}
        />
      )}

      {viewState === 'SUMMARY' && finishedWorkout && (
        <WorkoutSummary 
          workout={finishedWorkout} 
          onClose={() => navigate('/')} 
        />
      )}
    </WorkoutLayout>
  );
};

const NewWorkout: React.FC = () => {
  return <NewWorkoutContent />;
};

export default NewWorkout;
