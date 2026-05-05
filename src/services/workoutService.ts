import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Workout } from '../types';

const WORKOUTS_COLLECTION = 'workouts';

export const workoutService = {
  async saveWorkout(workout: Omit<Workout, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, WORKOUTS_COLLECTION), {
        ...workout,
        date: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, WORKOUTS_COLLECTION);
      throw error;
    }
  },

  async getExerciseHistory(exerciseId: string, userId: string, maxResults = 50): Promise<Workout[]> {
    try {
      const q = query(
        collection(db, WORKOUTS_COLLECTION),
        where('userId', '==', userId),
        // we'll fetch recent workouts and filter in memory for now
        orderBy('date', 'desc'),
        limit(100)
      );
      
      const snapshot = await getDocs(q);
      const workouts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: (data.date as Timestamp)?.toDate() || new Date(),
        } as Workout;
      });

      // Filter to only include workouts that have this exercise
      return workouts
        .filter(w => w.exercises.some(ex => ex.exerciseId === exerciseId))
        .slice(0, maxResults);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, WORKOUTS_COLLECTION);
      return [];
    }
  }
};
