import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  serverTimestamp,
  Timestamp,
  doc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { WorkoutTemplate } from '../types';

const TEMPLATES_COLLECTION = 'workout_templates';

export const templateService = {
  async saveTemplate(template: Omit<WorkoutTemplate, 'id' | 'createdAt'>): Promise<string> {
    try {
      const dbPayload = {
        ...template,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, TEMPLATES_COLLECTION), dbPayload);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, TEMPLATES_COLLECTION);
      throw error;
    }
  },

  async updateTemplate(templateId: string, updates: Partial<Omit<WorkoutTemplate, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const templateRef = doc(db, TEMPLATES_COLLECTION, templateId);
      await updateDoc(templateRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, TEMPLATES_COLLECTION);
      throw error;
    }
  },

  async deleteTemplate(templateId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, TEMPLATES_COLLECTION, templateId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, TEMPLATES_COLLECTION);
      throw error;
    }
  },

  async getUserTemplates(userId: string): Promise<WorkoutTemplate[]> {
    try {
      const q = query(
         collection(db, TEMPLATES_COLLECTION),
         where('userId', '==', userId),
         orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          name: data.name,
          exerciseIds: data.exerciseIds || [],
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        } as WorkoutTemplate;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, TEMPLATES_COLLECTION);
      return [];
    }
  }
};
