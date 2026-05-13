import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  serverTimestamp,
  Timestamp,
  doc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Workout, WorkoutExercise } from '../types';

const WORKOUTS_COLLECTION = 'workouts';

const cleanUndefined = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(v => cleanUndefined(v));
  } else if (obj !== null && typeof obj === 'object' && !(obj instanceof Date) && !(obj instanceof Timestamp)) {
    return Object.entries(obj).reduce((acc: any, [key, value]) => {
      if (value !== undefined) {
        acc[key] = cleanUndefined(value);
      }
      return acc;
    }, {});
  }
  return obj;
};

export const workoutService = {
  async saveWorkout(workout: Omit<Workout, 'id'>): Promise<string> {
    try {
      const cleanedWorkout = cleanUndefined({
        ...workout,
        date: workout.date instanceof Date ? Timestamp.fromDate(workout.date) : serverTimestamp(),
      });
      const docRef = await addDoc(collection(db, WORKOUTS_COLLECTION), cleanedWorkout);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, WORKOUTS_COLLECTION);
      throw error;
    }
  },

  async updateWorkout(workoutId: string, updates: Partial<Workout>): Promise<void> {
    try {
      const workoutRef = doc(db, WORKOUTS_COLLECTION, workoutId);
      const firestoreUpdates: any = { ...updates };
      
      if (updates.date instanceof Date) {
        firestoreUpdates.date = Timestamp.fromDate(updates.date);
      }
      
      firestoreUpdates.updatedAt = serverTimestamp();
      
      // Remove id from updates if it exists to avoid Firestore errors
      delete firestoreUpdates.id;
      
      const cleanedUpdates = cleanUndefined(firestoreUpdates);
      
      await updateDoc(workoutRef, cleanedUpdates);
    } catch (error) {
       handleFirestoreError(error, OperationType.UPDATE, WORKOUTS_COLLECTION);
       throw error;
    }
  },

  async deleteWorkout(workoutId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, WORKOUTS_COLLECTION, workoutId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, WORKOUTS_COLLECTION);
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
  },

  async getLastExerciseSession(exerciseId: string, userId: string): Promise<WorkoutExercise | null> {
    try {
      const history = await this.getExerciseHistory(exerciseId, userId, 1);
      if (history.length > 0) {
        return history[0].exercises.find(ex => ex.exerciseId === exerciseId) || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting last exercise session:', error);
      return null;
    }
  }
};
