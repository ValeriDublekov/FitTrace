import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import { useExercises } from '../hooks/useExercises';
import { Workout } from '../types';
import { GlobalHistoryList } from '../features/progress/components/GlobalHistoryList';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { WorkoutDetailsModal } from '../components/ui/WorkoutDetailsModal';
import { EditWorkoutModal } from '../components/ui/EditWorkoutModal';

const HistoryPage: React.FC = () => {
  const { t } = useTranslation();
  const { exercises } = useExercises();
  const { 
    history: globalHistory, 
    loading: globalHistoryLoading, 
    deleteWorkout: deleteGlobalWorkout 
  } = useWorkoutHistory();

  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [workoutToEdit, setWorkoutToEdit] = useState<Workout | null>(null);

  const handleDeleteWorkout = async () => {
    if (!workoutToDelete) return;
    try {
      await deleteGlobalWorkout(workoutToDelete);
      setWorkoutToDelete(null);
    } catch (error) {
      console.error('Failed to delete workout:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight font-sans">
          {t('workout.progress.title')}
        </h1>
        <p className="text-zinc-500 mt-1">{t('workout.progress.description')}</p>
      </header>

      <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
        <GlobalHistoryList
          history={globalHistory}
          loading={globalHistoryLoading}
          exercises={exercises}
          onSelectWorkout={setSelectedWorkout}
          onDeleteWorkout={setWorkoutToDelete}
        />
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
          exercises={exercises}
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
          onSave={() => setWorkoutToEdit(null)}
          onClose={() => setWorkoutToEdit(null)}
        />
      )}
    </div>
  );
};

export default HistoryPage;
