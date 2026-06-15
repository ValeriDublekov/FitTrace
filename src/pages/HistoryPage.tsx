import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import { useExercises } from '../hooks/useExercises';
import { Workout } from '../types';
import { GlobalHistoryList } from '../features/progress/components/GlobalHistoryList';
import { SimpleExerciseHistoryList } from '../features/progress/components/SimpleExerciseHistoryList';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { WorkoutDetailsModal } from '../components/ui/WorkoutDetailsModal';
import { EditWorkoutModal } from '../components/ui/EditWorkoutModal';
import { ListFilter, Sparkles, Activity } from 'lucide-react';

const HistoryPage: React.FC = () => {
  const { t } = useTranslation();
  const { exercises } = useExercises();
  const { 
    history: globalHistory, 
    loading: globalHistoryLoading, 
    deleteWorkout: deleteGlobalWorkout,
    mergeWorkouts
  } = useWorkoutHistory();

  const [viewMode, setViewMode] = useState<'workouts' | 'exercises'>('workouts');
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);
  const [workoutsToMerge, setWorkoutsToMerge] = useState<{ later: Workout; earlier: Workout } | null>(null);
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

  const handleMergeWorkouts = async () => {
    if (!workoutsToMerge) return;
    try {
      await mergeWorkouts(workoutsToMerge.earlier, workoutsToMerge.later);
      setWorkoutsToMerge(null);
    } catch (error) {
      console.error('Failed to merge workouts:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 md:p-8 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight font-sans">
            {t('workout.progress.title')}
          </h1>
          <p className="text-zinc-500 mt-1">{t('workout.progress.description')}</p>
        </div>

        {/* Beautiful Segmented View Switch */}
        <div className="flex bg-zinc-150 p-1.5 rounded-2xl gap-1 border border-zinc-200/50 self-start sm:self-center bg-zinc-100 sm:w-72">
          <button
            onClick={() => setViewMode('workouts')}
            className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'workouts'
                ? 'bg-zinc-900 text-white shadow-md'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Sparkles size={14} />
            {t('workout.progress.view_workouts')}
          </button>
          <button
            onClick={() => setViewMode('exercises')}
            className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'exercises'
                ? 'bg-zinc-900 text-white shadow-md'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Activity size={14} />
            {t('workout.progress.view_exercises')}
          </button>
        </div>
      </header>

      {globalHistoryLoading ? (
        <div className="p-12 flex justify-center bg-white border border-zinc-200 rounded-3xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : viewMode === 'workouts' ? (
        <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm p-4 sm:p-6">
          <GlobalHistoryList
            history={globalHistory}
            loading={globalHistoryLoading}
            exercises={exercises}
            onSelectWorkout={setSelectedWorkout}
            onDeleteWorkout={setWorkoutToDelete}
            onMergeWorkouts={(later, earlier) => setWorkoutsToMerge({ later, earlier })}
          />
        </div>
      ) : (
        <SimpleExerciseHistoryList
          history={globalHistory}
          exercises={exercises}
          onSelectWorkout={setSelectedWorkout}
        />
      )}

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

      <ConfirmModal
        isOpen={workoutsToMerge !== null}
        title={t('workout.progress.confirmations.merge_workouts.title')}
        message={t('workout.progress.confirmations.merge_workouts.message')}
        confirmLabel={t('workout.progress.merge_btn')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleMergeWorkouts}
        onCancel={() => setWorkoutsToMerge(null)}
        variant="info"
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
