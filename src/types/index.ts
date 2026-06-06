export type LoadType = 'WEIGHT_REPS' | 'LEVEL_REPS' | 'CARDIO';

export interface Admin {
  email: string;
  createdAt: Date;
}

export interface Exercise {
  id?: string;
  name: string;
  category: string;
  loadType: LoadType;
  thumbnailUrl?: string;
  defaultNotes?: string;
  description?: string;
  url?: string;
  userId?: string;
  isCustom: boolean;
  createdAt: Date;
  affectedPart?: string;
}

export interface ExerciseSet {
  setIndex: number;
  weight?: number;
  level?: number;
  reps?: number;
  duration?: number;
  isCompleted?: boolean;
}

export interface WorkoutExercise {
  id: string; // Internal instance ID for the session
  exerciseId: string;
  exerciseName: string;
  sessionNotes?: string;
  sets: ExerciseSet[];
  startedAt?: Date;
  durationSeconds?: number;
  affectedPart?: string;
}

export interface Workout {
  id?: string;
  userId: string;
  date: Date;
  updatedAt?: Date;
  notes?: string;
  exercises: WorkoutExercise[];
  startedAt?: Date;
  durationSeconds?: number;
}

export interface AppSettings {
  isPublic: boolean;
  updatedAt: Date;
  updatedBy: string;
}

export type FontSize = 'normal' | 'large' | 'xlarge';
export type Language = 'bg' | 'en';
export type NotificationSound = string;

export interface UserSettings {
  fontSize: FontSize;
  language?: Language;
  notificationSound: NotificationSound;
  isNotificationsEnabled: boolean;
  updatedAt: Date;
}

export function normalizeSets(sets: ExerciseSet[]): ExerciseSet[] {
  return sets.map((set, index) => ({
    ...set,
    setIndex: index + 1,
  }));
}

