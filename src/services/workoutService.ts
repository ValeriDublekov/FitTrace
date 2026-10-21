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
import { Workout, PersistedWorkout, WorkoutExercise, WorkoutSavePayload, WorkoutUpdatePayload, cleanUndefined } from '../types';

import { getBackendMode } from './backendMode';

const WORKOUTS_COLLECTION = 'workouts';

export const workoutService = {
  async saveWorkout(workout: Omit<Workout, 'id'>): Promise<string> {
    if (getBackendMode() === 'dotnet') {
      const payload = {
        date: workout.date instanceof Date ? workout.date.toISOString() : new Date().toISOString(),
        startedAt: workout.startedAt instanceof Date ? workout.startedAt.toISOString() : undefined,
        durationSeconds: workout.durationSeconds,
        notes: workout.notes,
        exercises: workout.exercises.map((we, idx) => ({
          exerciseId: we.exerciseId,
          exerciseName: we.exerciseName,
          orderIndex: idx + 1,
          sessionNotes: we.sessionNotes,
          supersetGroupId: we.supersetGroupId,
          sets: we.sets.map((s, sIdx) => ({
            setIndex: sIdx + 1,
            weight: s.weight,
            reps: s.reps,
            level: s.level,
            durationSeconds: s.duration,
            isCompleted: s.isCompleted !== false,
          })),
        })),
      };

      const res = await fetch('/api/v2/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Грешка при запис в .NET API: ${errText}`);
      }

      const data = await res.json();
      window.dispatchEvent(new CustomEvent('fittrace_workout_saved', { detail: data }));
      return data.id;
    }

    try {
      const rawPayload: WorkoutSavePayload = {
        ...workout,
        date: workout.date instanceof Date ? Timestamp.fromDate(workout.date) : serverTimestamp(),
      };
      const cleanedWorkout = cleanUndefined(rawPayload);
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
      const { id, date, updatedAt, ...restUpdates } = updates;
      
      const firestoreUpdates: WorkoutUpdatePayload = { ...restUpdates };
      
      if (date instanceof Date) {
        firestoreUpdates.date = Timestamp.fromDate(date);
      }
      
      firestoreUpdates.updatedAt = serverTimestamp();
      
      const cleanedUpdates = cleanUndefined(firestoreUpdates);
      
      await updateDoc(workoutRef, cleanedUpdates);
    } catch (error) {
       handleFirestoreError(error, OperationType.UPDATE, WORKOUTS_COLLECTION);
       throw error;
    }
  },

  async deleteWorkout(workoutId: string): Promise<void> {
    if (getBackendMode() === 'dotnet') {
      await fetch(`/api/v2/api/workouts/${workoutId}`, { method: 'DELETE' });
      window.dispatchEvent(new CustomEvent('fittrace_workout_deleted', { detail: workoutId }));
      return;
    }

    try {
      await deleteDoc(doc(db, WORKOUTS_COLLECTION, workoutId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, WORKOUTS_COLLECTION);
      throw error;
    }
  },

  async getExerciseHistory(exerciseId: string, userId: string, maxResults = 50): Promise<PersistedWorkout[]> {
    if (getBackendMode() === 'dotnet') {
      try {
        const res = await fetch('/api/v2/api/workouts');
        if (res.ok) {
          const list = await res.json();
          return list
            .filter((w: any) => w.exercises?.some((we: any) => we.exerciseId === exerciseId))
            .map((w: any) => ({
              id: w.id,
              userId: w.userId,
              date: new Date(w.date),
              notes: w.notes,
              durationSeconds: w.durationSeconds,
              exercises: w.exercises.map((we: any) => ({
                id: we.exerciseId,
                exerciseId: we.exerciseId,
                exerciseName: we.exerciseName || '',
                sessionNotes: we.sessionNotes,
                sets: we.sets.map((s: any) => ({
                  setIndex: s.setIndex,
                  weight: s.weight,
                  reps: s.reps,
                  level: s.level,
                  duration: s.durationSeconds,
                  isCompleted: s.isCompleted,
                })),
              })),
            }))
            .slice(0, maxResults);
        }
      } catch (err) {
        console.warn('Failed to fetch workouts from .NET API', err);
      }
      return [];
    }

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
          ...(data as Omit<Workout, 'id' | 'date'>),
          date: (data.date as Timestamp)?.toDate() || new Date(),
        } as PersistedWorkout;
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
  },

  async migrateExerciseData(oldExerciseId: string, newExerciseId: string, newExerciseName: string, userId: string): Promise<void> {
    try {
      // Find all workouts that contain this exercise for this user
      const q = query(
        collection(db, WORKOUTS_COLLECTION),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      const workoutsToUpdate = snapshot.docs.filter(doc => {
        const data = doc.data() as Workout;
        return data.exercises.some(ex => ex.exerciseId === oldExerciseId);
      });

      for (const workoutDoc of workoutsToUpdate) {
        const data = workoutDoc.data() as Workout;
        const updatedExercises = data.exercises.map(ex => {
          if (ex.exerciseId === oldExerciseId) {
            return {
              ...ex,
              exerciseId: newExerciseId,
              exerciseName: newExerciseName
            };
          }
          return ex;
        });

        await updateDoc(workoutDoc.ref, {
          exercises: updatedExercises,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, WORKOUTS_COLLECTION);
      throw error;
    }
  },

  async mergeWorkouts(earlierWorkout: PersistedWorkout, laterWorkout: PersistedWorkout): Promise<void> {
    try {
      if (!earlierWorkout.id || !laterWorkout.id) {
        throw new Error('Both workouts must have valid IDs to merge.');
      }

      const mergedExercises = [...earlierWorkout.exercises, ...laterWorkout.exercises];
      const notesParts = [earlierWorkout.notes, laterWorkout.notes].filter(Boolean) as string[];
      const mergedNotes = notesParts.join('\n\n');
      const mergedDurationSeconds = (earlierWorkout.durationSeconds || 0) + (laterWorkout.durationSeconds || 0);

      await this.updateWorkout(earlierWorkout.id, {
        exercises: mergedExercises,
        notes: mergedNotes,
        durationSeconds: mergedDurationSeconds
      });

      await this.deleteWorkout(laterWorkout.id);
    } catch (error) {
      console.error('Error merging workouts:', error);
      throw error;
    }
  }
};
