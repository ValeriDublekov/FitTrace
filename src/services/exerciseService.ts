import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from './firebase';
import { Exercise } from '../types';
import { workoutService } from './workoutService';

const EXERCISES_COLLECTION = 'exercises';

export const exerciseService = {
  async getExercises(userId?: string): Promise<Exercise[]> {
    try {
      const q = query(collection(db, EXERCISES_COLLECTION), orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      const exercises = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        } as Exercise;
      });

      if (userId) {
        return exercises.filter(ex => !ex.userId || ex.userId === userId);
      }
      return exercises;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, EXERCISES_COLLECTION);
      return [];
    }
  },

  async createExercise(exercise: Omit<Exercise, 'id' | 'createdAt'>): Promise<string> {
    try {
      // Remove any undefined fields to prevent Firestore errors
      const sanitizedData = Object.fromEntries(
        Object.entries(exercise).filter(([_, v]) => v !== undefined)
      );

      const docRef = await addDoc(collection(db, EXERCISES_COLLECTION), {
        ...sanitizedData,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, EXERCISES_COLLECTION);
      throw error;
    }
  },

  async updateExercise(id: string, exercise: Partial<Omit<Exercise, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const docRef = doc(db, EXERCISES_COLLECTION, id);
      
      // Remove any undefined fields to prevent Firestore errors
      const sanitizedData = Object.fromEntries(
        Object.entries(exercise).filter(([_, v]) => v !== undefined)
      );

      await updateDoc(docRef, {
        ...sanitizedData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${EXERCISES_COLLECTION}/${id}`);
      throw error;
    }
  },

  async uploadThumbnail(file: File): Promise<string> {
    try {
      const storageRef = ref(storage, `exercises/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error('Storage upload error:', error);
      throw error;
    }
  },

  async deleteExercise(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, EXERCISES_COLLECTION, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${EXERCISES_COLLECTION}/${id}`);
      throw error;
    }
  },

  async mergeCustomExercise(customExerciseId: string, systemExerciseId: string, systemExerciseName: string, userId: string): Promise<void> {
    try {
      // 1. Migrate all workout history
      await workoutService.migrateExerciseData(customExerciseId, systemExerciseId, systemExerciseName, userId);
      
      // 2. Delete the custom exercise
      await this.deleteExercise(customExerciseId);
    } catch (error) {
      console.error('Error merging exercises:', error);
      throw error;
    }
  }
};
