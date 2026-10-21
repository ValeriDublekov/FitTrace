/**
 * FitTrace v2 REST API клиент
 * Поддържа Cloudflare Tunnel или локален хост през VITE_API_URL
 */

export interface ExerciseDto {
  id: string;
  name: string;
  category: string;
  loadType: 'WEIGHT_REPS' | 'LEVEL_REPS' | 'CARDIO';
  affectedPart?: string;
  thumbnailUrl?: string;
  defaultNotes?: string;
  description?: string;
  url?: string;
  isCustom: boolean;
  userId?: string;
}

export interface ExerciseSetDto {
  setIndex: number;
  weight?: number;
  reps?: number;
  level?: number;
  durationSeconds?: number;
  isCompleted: boolean;
}

export interface WorkoutExerciseDto {
  exerciseId: string;
  exerciseName?: string;
  orderIndex: number;
  sessionNotes?: string;
  supersetGroupId?: string;
  sets: ExerciseSetDto[];
}

export interface CreateWorkoutPayload {
  date: string;
  startedAt?: string;
  durationSeconds?: number;
  notes?: string;
  exercises: WorkoutExerciseDto[];
}

export interface WorkoutResponseDto {
  id: string;
  userId: string;
  date: string;
  startedAt?: string;
  durationSeconds?: number;
  notes?: string;
  totalVolume: number;
  exercises: WorkoutExerciseDto[];
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export class FitTraceApiClient {
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  // Workouts
  getWorkouts(fromDate?: string, toDate?: string): Promise<WorkoutResponseDto[]> {
    const params = new URLSearchParams();
    if (fromDate) params.set('fromDate', fromDate);
    if (toDate) params.set('toDate', toDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<WorkoutResponseDto[]>(`/workouts${query}`);
  }

  getWorkoutById(id: string): Promise<WorkoutResponseDto> {
    return this.request<WorkoutResponseDto>(`/workouts/${id}`);
  }

  createWorkout(payload: CreateWorkoutPayload): Promise<WorkoutResponseDto> {
    return this.request<WorkoutResponseDto>('/workouts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  deleteWorkout(id: string): Promise<void> {
    return this.request<void>(`/workouts/${id}`, {
      method: 'DELETE',
    });
  }

  // Exercises
  getExercises(): Promise<ExerciseDto[]> {
    return this.request<ExerciseDto[]>('/exercises');
  }

  createCustomExercise(payload: Omit<ExerciseDto, 'id' | 'isCustom'>): Promise<ExerciseDto> {
    return this.request<ExerciseDto>('/exercises', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  deleteCustomExercise(id: string): Promise<void> {
    return this.request<void>(`/exercises/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new FitTraceApiClient();
