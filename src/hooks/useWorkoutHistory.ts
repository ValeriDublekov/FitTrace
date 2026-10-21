import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { workoutService } from '../services/workoutService';
import { Workout, PersistedWorkout } from '../types';
import { useAuth } from './useAuth';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getBackendMode, subscribeBackendMode } from '../services/backendMode';

interface WorkoutHistoryContextType {
  workouts: PersistedWorkout[];
  loading: boolean;
  deleteWorkout: (workoutId: string) => Promise<void>;
  mergeWorkouts: (earlierWorkout: PersistedWorkout, laterWorkout: PersistedWorkout) => Promise<void>;
}

const WorkoutHistoryContext = createContext<WorkoutHistoryContextType | undefined>(undefined);

export const WorkoutHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<PersistedWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendMode, setBackendModeState] = useState(getBackendMode());

  useEffect(() => {
    return subscribeBackendMode((newMode) => {
      setBackendModeState(newMode);
    });
  }, []);

  useEffect(() => {
    if (backendMode === 'dotnet') {
      const fetchDotnetWorkouts = async () => {
        setLoading(true);
        try {
          const res = await fetch('/api/v2/api/workouts');
          if (res.ok) {
            const list = await res.json();
            const mapped = list.map((w: any) => ({
              id: w.id,
              userId: w.userId,
              date: new Date(w.date),
              notes: w.notes,
              durationSeconds: w.durationSeconds,
              exercises: (w.exercises || []).map((we: any) => ({
                id: we.exerciseId,
                exerciseId: we.exerciseId,
                exerciseName: we.exerciseName || '',
                sessionNotes: we.sessionNotes,
                sets: (we.sets || []).map((s: any) => ({
                  setIndex: s.setIndex,
                  weight: s.weight,
                  reps: s.reps,
                  level: s.level,
                  duration: s.durationSeconds,
                  isCompleted: s.isCompleted,
                })),
              })),
            }));
            setWorkouts(mapped);
          }
        } catch (e) {
          console.warn('Failed to load workouts from .NET API', e);
        } finally {
          setLoading(false);
        }
      };

      fetchDotnetWorkouts();

      const handleSaved = () => fetchDotnetWorkouts();
      window.addEventListener('fittrace_workout_saved', handleSaved);
      window.addEventListener('fittrace_workout_deleted', handleSaved);

      return () => {
        window.removeEventListener('fittrace_workout_saved', handleSaved);
        window.removeEventListener('fittrace_workout_deleted', handleSaved);
      };
    }

    if (!user) {
      setLoading(false);
      setWorkouts([]);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, 'workouts'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbWorkouts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...(data as Omit<Workout, 'id' | 'date'>),
          date: (data.date as Timestamp)?.toDate() || new Date(),
        } as PersistedWorkout;
      });
      setWorkouts(dbWorkouts);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to workout history:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, backendMode]);

  const deleteWorkout = async (workoutId: string) => {
    try {
      await workoutService.deleteWorkout(workoutId);
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw error;
    }
  };

  const mergeWorkouts = async (earlierWorkout: PersistedWorkout, laterWorkout: PersistedWorkout) => {
    try {
      await workoutService.mergeWorkouts(earlierWorkout, laterWorkout);
    } catch (error) {
      console.error('Error merging workouts in hook:', error);
      throw error;
    }
  };

  const contextValue = useMemo(() => ({
    workouts,
    loading,
    deleteWorkout,
    mergeWorkouts,
  }), [workouts, loading]);

  return (
    React.createElement(WorkoutHistoryContext.Provider, { value: contextValue }, children)
  );
};

export const useWorkoutHistoryStore = () => {
  const context = useContext(WorkoutHistoryContext);
  if (!context) {
    throw new Error('useWorkoutHistoryStore must be used within a WorkoutHistoryProvider');
  }
  return context;
};

export const useWorkoutHistory = (maxResults = 50) => {
  const context = useContext(WorkoutHistoryContext);
  if (!context) {
    throw new Error('useWorkoutHistory must be used within a WorkoutHistoryProvider');
  }

  const { workouts, loading, deleteWorkout, mergeWorkouts } = context;

  const history = useMemo(() => {
    return workouts.slice(0, maxResults);
  }, [workouts, maxResults]);

  return { history, loading, deleteWorkout, mergeWorkouts };
};
