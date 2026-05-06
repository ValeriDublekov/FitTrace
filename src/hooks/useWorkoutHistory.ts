import { useState, useEffect } from 'react';
import { workoutService } from '../services/workoutService';
import { Workout } from '../types';
import { useAuth } from './useAuth';
import { collection, query, where, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

export const useWorkoutHistory = (maxResults = 50) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'workouts'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc'),
      limit(maxResults)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const workouts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: (doc.data().date as Timestamp)?.toDate() || new Date(),
      } as Workout));
      setHistory(workouts);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to workout history:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, maxResults]);

  return { history, loading };
};
