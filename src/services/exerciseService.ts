import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy,
  where,
  deleteField,
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
      const requests = [];

      // 1. Query global exercises (where isCustom == false)
      const globalQuery = query(
        collection(db, EXERCISES_COLLECTION),
        where('isCustom', '==', false)
      );
      requests.push(getDocs(globalQuery));

      // 2. Query user custom exercises (where userId == userId and isCustom == true) if userId is provided
      if (userId) {
        const customQuery = query(
          collection(db, EXERCISES_COLLECTION),
          where('userId', '==', userId),
          where('isCustom', '==', true)
        );
        requests.push(getDocs(customQuery));
      }

      const snapshots = await Promise.all(requests);
      const exercisesMap = new Map<string, Exercise>();

      snapshots.forEach(snapshot => {
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const exercise = {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
          } as Exercise;
          exercisesMap.set(doc.id, exercise);
        });
      });

      // Sort combined list by name in Bulgarian-friendly/alphabetic ascending order
      const mergedList = Array.from(exercisesMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      return mergedList;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, EXERCISES_COLLECTION);
      return [];
    }
  },

  async createExercise(exercise: Omit<Exercise, 'id' | 'createdAt'>): Promise<string> {
    try {
      // Determine normalization values
      const isCustom = exercise.isCustom ?? !!exercise.userId;
      const normalizedExercise = {
        ...exercise,
        isCustom,
        userId: isCustom ? exercise.userId : null
      };

      // Remove any undefined or omitted fields to prevent Firestore complaints
      const sanitizedData = Object.fromEntries(
        Object.entries(normalizedExercise).filter(([k, v]) => {
          if (v === undefined) return false;
          if (!isCustom && k === 'userId') return false; // omit userId for global exercises
          return true;
        })
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
      
      const isCustom = exercise.isCustom ?? !!exercise.userId;

      const normalizedExercise = {
        ...exercise,
        isCustom,
        userId: isCustom ? exercise.userId : deleteField()
      };

      // Remove any undefined fields to prevent Firestore errors
      const sanitizedData = Object.fromEntries(
        Object.entries(normalizedExercise).filter(([_, v]) => v !== undefined)
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
