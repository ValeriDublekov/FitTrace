import { useEffect } from 'react';
import { WorkoutExercise } from '../../../types';
import { STORAGE_KEYS } from '../../../constants';

export const getPersistedExercises = (): WorkoutExercise[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_EXERCISES);
  try {
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Error parsing active exercises from localStorage', e);
    return [];
  }
};

export const getPersistedNotes = (): string => {
  return localStorage.getItem(STORAGE_KEYS.WORKOUT_NOTES) || '';
};

export const getPersistedDate = (): Date => {
  const saved = localStorage.getItem(STORAGE_KEYS.WORKOUT_DATE);
  return saved ? new Date(saved) : new Date();
};

export const getPersistedStartedAt = (): Date | null => {
  const saved = localStorage.getItem(STORAGE_KEYS.WORKOUT_STARTED_AT);
  return saved ? new Date(saved) : null;
};

export const getPersistedSessionMode = (urlMode: 'LIVE' | 'MANUAL'): 'LIVE' | 'MANUAL' => {
  const savedExercises = localStorage.getItem(STORAGE_KEYS.ACTIVE_EXERCISES);
  let hasSavedExercises = false;
  try {
    hasSavedExercises = !!(savedExercises && JSON.parse(savedExercises).length > 0);
  } catch (e) {
    hasSavedExercises = false;
  }
  
  if (hasSavedExercises) {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSION_MODE);
    return (saved as 'LIVE' | 'MANUAL') || urlMode;
  }
  
  return urlMode;
};

export const clearPersistedSession = () => {
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_EXERCISES);
  localStorage.removeItem(STORAGE_KEYS.WORKOUT_NOTES);
  localStorage.removeItem(STORAGE_KEYS.WORKOUT_DATE);
  localStorage.removeItem(STORAGE_KEYS.WORKOUT_STARTED_AT);
  localStorage.removeItem(STORAGE_KEYS.SESSION_MODE);
};

export const useWorkoutSessionPersistence = (
  activeExercises: WorkoutExercise[],
  workoutNotes: string,
  workoutDate: Date,
  workoutStartedAt: Date | null,
  sessionMode: 'LIVE' | 'MANUAL'
) => {
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_EXERCISES, JSON.stringify(activeExercises));
  }, [activeExercises]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_NOTES, workoutNotes);
  }, [workoutNotes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_DATE, workoutDate.toISOString());
  }, [workoutDate]);

  useEffect(() => {
    if (workoutStartedAt) {
      localStorage.setItem(STORAGE_KEYS.WORKOUT_STARTED_AT, workoutStartedAt.toISOString());
    } else {
      localStorage.removeItem(STORAGE_KEYS.WORKOUT_STARTED_AT);
    }
  }, [workoutStartedAt]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSION_MODE, sessionMode);
  }, [sessionMode]);
};
