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
import { TrendingUp, BarChart2, Activity, Info } from 'lucide-react';

// Sub-components
import { ExerciseProgressSelector } from '../features/progress/components/ExerciseProgressSelector';
import { ExerciseProgressChart } from '../features/progress/components/ExerciseProgressChart';
import { ExerciseSessionList } from '../features/progress/components/ExerciseSessionList';

type AnalysisType = 'EXERCISES' | 'VOLUME' | 'STRENGTH';

const ProgressPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { exercises, loading: exercisesLoading } = useExercises();
  const { history: globalHistory, loading: globalHistoryLoading } = useWorkoutHistory(1000);
  const [activeTab, setActiveTab] = useState<AnalysisType>('EXERCISES');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'participation' | 'name' | 'recent'>('participation');
  const [showMobileSelector, setShowMobileSelector] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [workoutToEdit, setWorkoutToEdit] = useState<Workout | null>(null);

  const exerciseStats = useMemo(() => {
    const counts: Record<string, number> = {};
    const lastDates: Record<string, number> = {};
    
    globalHistory.forEach(workout => {
      // Use a Set per workout to count each exercise only once per session
      const workoutExercises = new Set<string>();
      workout.exercises.forEach(ex => {
        workoutExercises.add(ex.exerciseId);
        
        // Update last performed date
        const time = workout.date.getTime();
        if (!lastDates[ex.exerciseId] || time > lastDates[ex.exerciseId]) {
          lastDates[ex.exerciseId] = time;
        }
      });
      
      workoutExercises.forEach(exId => {
        counts[exId] = (counts[exId] || 0) + 1;
      });
    });
    
    return { counts, lastDates };
  }, [globalHistory]);

  const exercisesWithHistory = useMemo(() => {
    const filtered = exercises.filter(ex => exerciseStats.counts[ex.id || '']);
    
    // Initial filtering logic (search query will be handled inside the component or here)
    // Actually, it's better to pass all exercisesWithHistory and let the selector handle search + the new filter/sort
    return filtered;
  }, [exercises, exerciseStats.counts]);

  const selectedExercise = exercises.find(e => e.id === selectedExerciseId);
  const { 
    history: exerciseHistory, 
    loading: exerciseHistoryLoading, 
    deleteWorkout: deleteExerciseWorkout 
  } = useExerciseHistory(selectedExerciseId || undefined);

  const handleSelectExercise = (id: string | null) => {
    setSelectedExerciseId(id);
    setShowMobileSelector(false);
  };

  const handleDeleteWorkout = async () => {
    if (!workoutToDelete) return;
    try {
      if (selectedExerciseId) {
        await deleteExerciseWorkout(workoutToDelete);
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

  const tabs = [
    { id: 'EXERCISES' as AnalysisType, label: t('workout.titles.exercises'), icon: Activity },
    { id: 'VOLUME' as AnalysisType, label: t('workout.total_volume'), icon: BarChart2, disabled: true },
    { id: 'STRENGTH' as AnalysisType, label: 'Strength', icon: TrendingUp, disabled: true },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 pb-24 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
          <BarChart2 className="text-indigo-600 w-8 h-8" />
          {t('dashboard.analytics')}
        </h1>
        <p className="text-zinc-500 mt-1">
          {t('dashboard.analytics_desc')}
        </p>
      </header>

      {/* Tabs Layout */}
      <div className="flex overflow-x-auto gap-2 pb-2 mb-8 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && setActiveTab(tab.id)}
            disabled={tab.disabled}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all border-2 ${
              activeTab === tab.id
                ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg'
                : tab.disabled 
                  ? 'bg-zinc-100 border-zinc-100 text-zinc-400 cursor-not-allowed opacity-60'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
            {tab.disabled && (
              <span className="text-[10px] bg-zinc-200 text-zinc-500 px-1.5 py-0.5 rounded-md uppercase tracking-wider ml-1">
                Soon
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {activeTab === 'EXERCISES' && (
          <>
            <ExerciseProgressSelector
              exercises={exercisesWithHistory}
              loading={exercisesLoading || globalHistoryLoading}
              selectedExerciseId={selectedExerciseId}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              exerciseStats={exerciseStats}
              onSelectExercise={handleSelectExercise}
              showMobileSelector={showMobileSelector}
              setShowMobileSelector={setShowMobileSelector}
            />

            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence mode="wait">
                {!selectedExerciseId ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-full flex flex-col items-center justify-center p-12 bg-white border-2 border-zinc-100 border-dashed rounded-[40px] text-center"
                  >
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 text-indigo-500">
                      <Activity size={40} />
                    </div>
                    <h3 className="text-xl font-black text-zinc-900 mb-2">
                      {t('workout.progress.search')}
                    </h3>
                    <p className="text-zinc-500 max-w-xs">
                      {t('workout.no_history')}
                    </p>
                  </motion.div>
                ) : exerciseHistoryLoading ? (
                  <div className="h-64 flex items-center justify-center bg-white border border-zinc-200 rounded-[40px]">
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
          </>
        )}

        {/* Future expansion areas */}
        {(activeTab === 'VOLUME' || activeTab === 'STRENGTH') && (
          <div className="col-span-full py-20 text-center">
            <Info className="mx-auto text-zinc-300 mb-4" size={48} />
            <p className="text-zinc-400 font-medium">Additional analytics coming soon.</p>
          </div>
        )}
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

export default ProgressPage;
