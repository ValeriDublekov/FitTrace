import { Timestamp, FieldValue } from 'firebase/firestore';

export type LoadType = 'WEIGHT_REPS' | 'LEVEL_REPS' | 'CARDIO';

export type WithId<T> = T & { id: string };

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

export type PersistedExercise = WithId<Exercise>;

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
  supersetGroupId?: string;
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

export type PersistedWorkout = WithId<Workout>;

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

export interface WorkoutTemplate {
  id?: string;
  userId: string;
  name: string;
  exerciseIds: string[];
  createdAt: Date;
}

export type PersistedWorkoutTemplate = WithId<WorkoutTemplate>;

export type ExerciseCreateInput = Omit<Exercise, 'id' | 'createdAt'>;
export type ExerciseUpdateInput = Partial<ExerciseCreateInput>;

export function normalizeExerciseCreatePayload(
  exercise: ExerciseCreateInput,
  adminMode: boolean,
  userId: string | undefined
): ExerciseCreateInput {
  const isCustom = !adminMode;
  return {
    ...exercise,
    isCustom,
    userId: isCustom && userId ? userId : undefined,
  };
}

export function normalizeExerciseUpdatePayload(
  exercise: ExerciseUpdateInput,
  adminMode: boolean,
  userId: string | undefined
): ExerciseUpdateInput {
  const isCustom = !adminMode;
  return {
    ...exercise,
    isCustom,
    userId: isCustom && userId ? userId : undefined,
  };
}

export type WorkoutUpdatePayload = Partial<Omit<Workout, 'id' | 'date' | 'updatedAt'>> & {
  date?: Timestamp | FieldValue;
  updatedAt?: FieldValue;
};

export type WorkoutSavePayload = Omit<Workout, 'id' | 'date'> & {
  date: Timestamp | FieldValue;
};

export function cleanUndefined<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map((v: unknown) => cleanUndefined(v)) as unknown as T;
  } else if (
    obj !== null &&
    typeof obj === 'object' &&
    !(obj instanceof Date) &&
    !(obj instanceof Timestamp) &&
    !(obj instanceof FieldValue)
  ) {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanUndefined(value);
      }
    }
    return cleaned as unknown as T;
  }
  return obj;
}


