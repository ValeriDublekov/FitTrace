import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useExercises } from '../hooks/useExercises';
import { useExerciseHistory } from '../hooks/useExerciseHistory';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import { Workout } from '../types';
import { AnimatePresence, motion } from 'motion/react';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { WorkoutDetailsModal } from '../components/ui/WorkoutDetailsModal';
import { EditWorkoutModal } from '../components/ui/EditWorkoutModal';
import { workoutService } from '../services/workoutService';

// Sub-components
import { ProgressHeader } from '../features/progress/components/ProgressHeader';
import { ExerciseProgressSelector } from '../features/progress/components/ExerciseProgressSelector';
import { GlobalHistoryList } from '../features/progress/components/GlobalHistoryList';
import { ExerciseProgressChart } from '../features/progress/components/ExerciseProgressChart';
import { ExerciseSessionList } from '../features/progress/components/ExerciseSessionList';

const ProgressPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { exercises, loading: exercisesLoading } = useExercises();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSelector, setShowMobileSelector] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [workoutToEdit, setWorkoutToEdit] = useState<Workout | null>(null);

  const selectedExercise = exercises.find(e => e.id === selectedExerciseId);
  const { 
    history: exerciseHistory, 
    loading: exerciseHistoryLoading, 
    deleteWorkout: deleteExerciseWorkout 
  } = useExerciseHistory(selectedExerciseId || undefined);
  
  const { 
    history: globalHistory, 
    loading: globalHistoryLoading, 
    deleteWorkout: deleteGlobalWorkout 
  } = useWorkoutHistory();

  const handleSelectExercise = (id: string | null) => {
    setSelectedExerciseId(id);
    setShowMobileSelector(false);
  };

  const handleDeleteWorkout = async () => {
    if (!workoutToDelete) return;
    try {
      if (selectedExerciseId) {
        await deleteExerciseWorkout(workoutToDelete);
      } else {
        await deleteGlobalWorkout(workoutToDelete);
      }
      setWorkoutToDelete(null);
    } catch (error) {
      console.error('Failed to delete workout:', error);
    }
  };

  const chartData = useMemo(() => {
    if (!exerciseHistory || !selectedExercise) return [];

    return exerciseHistory
      .map(workout => {
        const matchingExercises = workout.exercises.filter(ex => ex.exerciseId === selectedExercise.id);
        if (matchingExercises.length === 0) return null;

        const maxVal = matchingExercises.reduce((currentMax, exInstance) => {
          const instanceMax = exInstance.sets.reduce((setMax, set) => {
            const val = selectedExercise.loadType === 'WEIGHT_REPS' ? (set.weight || 0) : (set.level || 0);
            return val > setMax ? val : setMax;
          }, 0);
          return instanceMax > currentMax ? instanceMax : currentMax;
        }, 0);

        return {
          date: workout.date.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' }),
          timestamp: workout.date.getTime(),
          value: maxVal,
          workoutId: workout.id
        };
      })
      .filter((d): d is { date: string; timestamp: number; value: number; workoutId: string } => d !== null)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [exerciseHistory, selectedExercise, i18n.language]);

  const unit = selectedExercise?.loadType === 'WEIGHT_REPS' ? 'kg' : 'Level';

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 md:p-8">
      <ProgressHeader selectedExercise={selectedExercise} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ExerciseProgressSelector
          exercises={exercises}
          loading={exercisesLoading}
          selectedExerciseId={selectedExerciseId}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectExercise={handleSelectExercise}
          showMobileSelector={showMobileSelector}
          setShowMobileSelector={setShowMobileSelector}
        />

        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {!selectedExerciseId ? (
              <GlobalHistoryList
                key="global"
                history={globalHistory}
                loading={globalHistoryLoading}
                exercises={exercises}
                onSelectWorkout={setSelectedWorkout}
                onDeleteWorkout={setWorkoutToDelete}
              />
            ) : exerciseHistoryLoading ? (
              <div className="h-64 flex items-center justify-center bg-white border border-zinc-200 rounded-3xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <motion.div 
                key={selectedExerciseId}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {chartData.length > 0 && (
                  <ExerciseProgressChart 
                    data={chartData} 
                    unit={unit} 
                  />
                )}
                
                <ExerciseSessionList
                  history={exerciseHistory}
                  selectedExercise={selectedExercise}
                  onDeleteWorkout={setWorkoutToDelete}
                  onSelectWorkout={setSelectedWorkout}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmModal
        isOpen={workoutToDelete !== null}
        title={t('workout.progress.confirmations.delete_workout.title')}
        message={t('workout.progress.confirmations.delete_workout.message')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleDeleteWorkout}
        onCancel={() => setWorkoutToDelete(null)}
        variant="danger"
      />

      {selectedWorkout && (
        <WorkoutDetailsModal
          workout={selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
          onEdit={(workout) => {
            setSelectedWorkout(null);
            setWorkoutToEdit(workout);
          }}
        />
      )}

      {workoutToEdit && (
        <EditWorkoutModal
          workout={workoutToEdit}
          onSave={(updated) => {
            // Updated via onSnapshot automatically
            setWorkoutToEdit(null);
          }}
          onClose={() => setWorkoutToEdit(null)}
        />
      )}
    </div>
  );
};

export default ProgressPage;
