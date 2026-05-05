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
  createdAt: Date;
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
  exerciseId: string;
  exerciseName: string;
  sessionNotes?: string;
  sets: ExerciseSet[];
}

export interface Workout {
  id?: string;
  userId: string;
  date: Date;
  updatedAt?: Date;
  notes?: string;
  exercises: WorkoutExercise[];
}
