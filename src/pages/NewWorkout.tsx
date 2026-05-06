import React from 'react';
import { WorkoutLayout } from '../components/layout/WorkoutLayout';
import { CategorySelector } from '../features/workout/components/CategorySelector';
import { ExerciseSelector } from '../features/workout/components/ExerciseSelector';
import { ActiveSession } from '../features/workout/components/ActiveSession';
import { WorkoutSessionProvider } from '../features/workout/context/WorkoutSessionContext';
import { useWorkoutFlow } from '../features/workout/hooks/useWorkoutFlow';

import { WorkoutSetup } from '../features/workout/components/WorkoutSetup';

const NewWorkoutContent: React.FC = () => {
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
    createExercise,
    updateExercise,
    deleteExercise,
    uploadThumbnail
  } = useWorkoutFlow();

  const getHeaderTitle = () => {
    if (viewState === 'SETUP') return 'New Workout';
    if (viewState === 'ACTIVE_SESSION') return 'Workout Session';
    if (viewState === 'SELECT_CATEGORY') return 'Select Focus';
    return selectedCategory || 'Exercises';
  };

  return (
    <WorkoutLayout title={getHeaderTitle()} onBack={handleBack}>
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
          onUpdateCustomExercise={updateExercise}
          onDeleteCustomExercise={deleteExercise}
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
          onAddClick={() => setViewState('SELECT_CATEGORY')}
          onFinish={handleFinish}
          onExerciseFinish={() => setViewState('SELECT_EXERCISE')}
        />
      )}
    </WorkoutLayout>
  );
};

const NewWorkout: React.FC = () => {
  return (
    <WorkoutSessionProvider>
      <NewWorkoutContent />
    </WorkoutSessionProvider>
  );
};

export default NewWorkout;
