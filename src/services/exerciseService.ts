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

const EXERCISES_COLLECTION = 'exercises';

export const exerciseService = {
  async getExercises(): Promise<Exercise[]> {
    try {
      const q = query(collection(db, EXERCISES_COLLECTION), orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        } as Exercise;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, EXERCISES_COLLECTION);
      return [];
    }
  },

  async createExercise(exercise: Omit<Exercise, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, EXERCISES_COLLECTION), {
        ...exercise,
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
      await updateDoc(docRef, {
        ...exercise,
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
  }
};
