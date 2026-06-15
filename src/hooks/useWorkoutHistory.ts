import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { workoutService } from '../services/workoutService';
import { Workout } from '../types';
import { useAuth } from './useAuth';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

interface WorkoutHistoryContextType {
  workouts: Workout[];
  loading: boolean;
  deleteWorkout: (workoutId: string) => Promise<void>;
  mergeWorkouts: (earlierWorkout: Workout, laterWorkout: Workout) => Promise<void>;
}

const WorkoutHistoryContext = createContext<WorkoutHistoryContextType | undefined>(undefined);

export const WorkoutHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      const dbWorkouts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: (doc.data().date as Timestamp)?.toDate() || new Date(),
      } as Workout));
      setWorkouts(dbWorkouts);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to workout history:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const deleteWorkout = async (workoutId: string) => {
    try {
      await workoutService.deleteWorkout(workoutId);
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw error;
    }
  };

  const mergeWorkouts = async (earlierWorkout: Workout, laterWorkout: Workout) => {
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
