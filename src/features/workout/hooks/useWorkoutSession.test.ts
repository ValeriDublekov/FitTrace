// @vitest-environment happy-dom

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWorkoutSessionMutations } from './useWorkoutSessionMutations';
import { useFinishWorkout } from './useFinishWorkout';
import {
  getPersistedExercises,
  getPersistedNotes,
  getPersistedDate,
  getPersistedStartedAt,
  getPersistedSessionMode,
  clearPersistedSession,
} from './useWorkoutSessionPersistence';
import { WorkoutExercise, PersistedExercise } from '../../../types';

// Setup localStorage mocks if not fully supported in the environment,
// but since we are in happy-dom, standard localStorage is fully supported!
// We'll clean it up before each test.

// Mocks for hooks & services
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'test-user-123' } }),
}));

vi.mock('../../../hooks/useUserSettings', () => ({
  useUserSettings: () => ({
    settings: { isNotificationsEnabled: true, notificationSound: 'beep' },
  }),
}));

vi.mock('../../../utils/audioUtils', () => ({
  playNotificationSound: vi.fn().mockResolvedValue(undefined),
}));

const mockGetLastExerciseSession = vi.fn().mockResolvedValue(null);
const mockSaveWorkout = vi.fn().mockResolvedValue('new-workout-id');

vi.mock('../../../services/workoutService', () => ({
  workoutService: {
    getLastExerciseSession: (...args: any[]) => mockGetLastExerciseSession(...args),
    saveWorkout: (...args: any[]) => mockSaveWorkout(...args),
  },
}));

const mockExercise: PersistedExercise = {
  id: 'bench-press',
  name: 'Bench Press',
  category: 'chest',
  loadType: 'WEIGHT_REPS',
  affectedPart: 'chest',
  isCustom: false,
  createdAt: new Date(),
};

describe('Workout Session Regression Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('1. LIVE Mode Behavior (useWorkoutSessionMutations)', () => {
    it('should add an exercise with initial set isCompleted as false in LIVE mode', async () => {
      const setActiveExercises = vi.fn();
      const setExpandedExerciseId = vi.fn();
      const setWorkoutStartedAt = vi.fn();
      const setWorkoutDate = vi.fn();

      const { result } = renderHook(() =>
        useWorkoutSessionMutations({
          activeExercises: [],
          setActiveExercises,
          sessionMode: 'LIVE',
          startRestTimer: vi.fn(),
          expandedExerciseId: null,
          setExpandedExerciseId,
          setWorkoutStartedAt,
          setWorkoutDate,
        })
      );

      await act(async () => {
        await result.current.addExercise(mockExercise);
      });

      expect(setActiveExercises).toHaveBeenCalled();
      const updater = setActiveExercises.mock.calls[0][0];
      const updatedList = updater([]);
      expect(updatedList).toHaveLength(1);
      expect(updatedList[0].exerciseId).toBe('bench-press');
      expect(updatedList[0].sets[0].isCompleted).toBe(false);
    });

    it('should trigger rest timer when completing a set in LIVE mode', () => {
      const setActiveExercises = vi.fn();
      const startRestTimer = vi.fn();

      const activeExercises: WorkoutExercise[] = [
        {
          id: 'ex-instance-1',
          exerciseId: 'bench-press',
          exerciseName: 'Bench Press',
          affectedPart: 'chest',
          startedAt: new Date(),
          sets: [
            { setIndex: 1, reps: 10, weight: 60, level: 0, duration: 0, isCompleted: false },
          ],
        },
      ];

      const { result } = renderHook(() =>
        useWorkoutSessionMutations({
          activeExercises,
          setActiveExercises,
          sessionMode: 'LIVE',
          startRestTimer,
          expandedExerciseId: null,
          setExpandedExerciseId: vi.fn(),
          setWorkoutStartedAt: vi.fn(),
          setWorkoutDate: vi.fn(),
        })
      );

      act(() => {
        result.current.updateSet('ex-instance-1', 1, { isCompleted: true });
      });

      expect(setActiveExercises).toHaveBeenCalled();
      const updater = setActiveExercises.mock.calls[0][0];
      const updatedList = updater(activeExercises);
      expect(updatedList[0].sets[0].isCompleted).toBe(true);
      expect(startRestTimer).toHaveBeenCalled();
    });
  });

  describe('2. MANUAL Mode Behavior (useWorkoutSessionMutations)', () => {
    it('should add an exercise with initial set isCompleted as true in MANUAL mode', async () => {
      const setActiveExercises = vi.fn();

      const { result } = renderHook(() =>
        useWorkoutSessionMutations({
          activeExercises: [],
          setActiveExercises,
          sessionMode: 'MANUAL',
          startRestTimer: vi.fn(),
          expandedExerciseId: null,
          setExpandedExerciseId: vi.fn(),
          setWorkoutStartedAt: vi.fn(),
          setWorkoutDate: vi.fn(),
        })
      );

      await act(async () => {
        await result.current.addExercise(mockExercise);
      });

      expect(setActiveExercises).toHaveBeenCalled();
      const updater = setActiveExercises.mock.calls[0][0];
      const updatedList = updater([]);
      expect(updatedList[0].sets[0].isCompleted).toBe(true);
    });

    it('should add a new set with isCompleted as true in MANUAL mode', () => {
      const setActiveExercises = vi.fn();

      const activeExercises: WorkoutExercise[] = [
        {
          id: 'ex-instance-1',
          exerciseId: 'bench-press',
          exerciseName: 'Bench Press',
          affectedPart: 'chest',
          startedAt: new Date(),
          sets: [
            { setIndex: 1, reps: 10, weight: 60, level: 0, duration: 0, isCompleted: true },
          ],
        },
      ];

      const { result } = renderHook(() =>
        useWorkoutSessionMutations({
          activeExercises,
          setActiveExercises,
          sessionMode: 'MANUAL',
          startRestTimer: vi.fn(),
          expandedExerciseId: null,
          setExpandedExerciseId: vi.fn(),
          setWorkoutStartedAt: vi.fn(),
          setWorkoutDate: vi.fn(),
        })
      );

      act(() => {
        result.current.addSet('ex-instance-1');
      });

      expect(setActiveExercises).toHaveBeenCalled();
      const updater = setActiveExercises.mock.calls[0][0];
      const updatedList = updater(activeExercises);
      expect(updatedList[0].sets).toHaveLength(2);
      expect(updatedList[0].sets[1].isCompleted).toBe(true);
    });
  });

  describe('3. Workout Completion Filtering (useFinishWorkout)', () => {
    it('should filter out incomplete sets in LIVE mode', async () => {
      const clearSession = vi.fn();
      const activeExercises: WorkoutExercise[] = [
        {
          id: 'ex-1',
          exerciseId: 'bench-press',
          exerciseName: 'Bench Press',
          affectedPart: 'chest',
          startedAt: new Date(),
          sets: [
            { setIndex: 1, reps: 10, weight: 60, level: 0, duration: 0, isCompleted: true },  // Keep
            { setIndex: 2, reps: 8, weight: 60, level: 0, duration: 0, isCompleted: false },  // Filter out (incomplete)
            { setIndex: 3, reps: 0, weight: 0, level: 0, duration: 0, isCompleted: true },    // Filter out (no data)
          ],
        },
      ];

      const { result } = renderHook(() =>
        useFinishWorkout({
          activeExercises,
          workoutNotes: 'Completed flat bench press',
          workoutDate: new Date(),
          workoutStartedAt: new Date(),
          sessionMode: 'LIVE',
          clearSession,
        })
      );

      await act(async () => {
        await result.current.finishWorkout();
      });

      expect(mockSaveWorkout).toHaveBeenCalled();
      const savedPayload = mockSaveWorkout.mock.calls[0][0];
      expect(savedPayload.exercises).toHaveLength(1);
      expect(savedPayload.exercises[0].sets).toHaveLength(1);
      expect(savedPayload.exercises[0].sets[0].reps).toBe(10);
      expect(clearSession).toHaveBeenCalled();
    });

    it('should filter out exercises with no sets left', async () => {
      const clearSession = vi.fn();
      const activeExercises: WorkoutExercise[] = [
        {
          id: 'ex-1',
          exerciseId: 'bench-press',
          exerciseName: 'Bench Press',
          affectedPart: 'chest',
          startedAt: new Date(),
          sets: [
            { setIndex: 1, reps: 8, weight: 60, level: 0, duration: 0, isCompleted: false }, // Filtered (incomplete in LIVE)
          ],
        },
      ];

      const { result } = renderHook(() =>
        useFinishWorkout({
          activeExercises,
          workoutNotes: '',
          workoutDate: new Date(),
          workoutStartedAt: new Date(),
          sessionMode: 'LIVE',
          clearSession,
        })
      );

      await act(async () => {
        await result.current.finishWorkout();
      });

      expect(mockSaveWorkout).not.toHaveBeenCalled();
      expect(clearSession).toHaveBeenCalled(); // Session is cleared even if no sets saved
    });

    it('should save sets in MANUAL mode even if isCompleted is false, provided they have valid data', async () => {
      const clearSession = vi.fn();
      const activeExercises: WorkoutExercise[] = [
        {
          id: 'ex-1',
          exerciseId: 'bench-press',
          exerciseName: 'Bench Press',
          affectedPart: 'chest',
          startedAt: new Date(),
          sets: [
            { setIndex: 1, reps: 10, weight: 60, level: 0, duration: 0, isCompleted: false }, // Keep (has data in MANUAL)
            { setIndex: 2, reps: 0, weight: 0, level: 0, duration: 0, isCompleted: true },     // Filter out (no data)
          ],
        },
      ];

      const { result } = renderHook(() =>
        useFinishWorkout({
          activeExercises,
          workoutNotes: '',
          workoutDate: new Date(),
          workoutStartedAt: new Date(),
          sessionMode: 'MANUAL',
          clearSession,
        })
      );

      await act(async () => {
        await result.current.finishWorkout();
      });

      expect(mockSaveWorkout).toHaveBeenCalled();
      const savedPayload = mockSaveWorkout.mock.calls[0][0];
      expect(savedPayload.exercises).toHaveLength(1);
      expect(savedPayload.exercises[0].sets).toHaveLength(1);
      expect(savedPayload.exercises[0].sets[0].reps).toBe(10);
      expect(clearSession).toHaveBeenCalled();
    });
  });

  describe('4. Failed Save Behavior (useFinishWorkout)', () => {
    it('should keep session data, rethrow error on save failure, and reset isSaving', async () => {
      const clearSession = vi.fn();
      const activeExercises: WorkoutExercise[] = [
        {
          id: 'ex-1',
          exerciseId: 'bench-press',
          exerciseName: 'Bench Press',
          affectedPart: 'chest',
          startedAt: new Date(),
          sets: [{ setIndex: 1, reps: 10, weight: 60, level: 0, duration: 0, isCompleted: true }],
        },
      ];

      // Force saveWorkout to fail
      mockSaveWorkout.mockRejectedValueOnce(new Error('Firebase network error'));

      const { result } = renderHook(() =>
        useFinishWorkout({
          activeExercises,
          workoutNotes: '',
          workoutDate: new Date(),
          workoutStartedAt: new Date(),
          sessionMode: 'LIVE',
          clearSession,
        })
      );

      // Verify isSaving is initially false
      expect(result.current.isSaving).toBe(false);

      await act(async () => {
        await expect(result.current.finishWorkout()).rejects.toThrow('Firebase network error');
      });

      // Ensure clearSession was NOT called so session data is kept
      expect(clearSession).not.toHaveBeenCalled();

      // Verify isSaving was reset to false after throwing
      expect(result.current.isSaving).toBe(false);
    });
  });

  describe('5. useWorkoutSessionPersistence hydration/resume behavior', () => {
    it('should read hydrated exercises from localStorage', () => {
      const mockExercises: WorkoutExercise[] = [
        {
          id: 'instance-1',
          exerciseId: 'bench-press',
          exerciseName: 'Bench Press',
          affectedPart: 'chest',
          sets: [{ setIndex: 1, reps: 10, weight: 60, isCompleted: true }],
        },
      ];
      localStorage.setItem('active_exercises', JSON.stringify(mockExercises));
      expect(getPersistedExercises()).toEqual(mockExercises);
    });

    it('should handle invalid/corrupt JSON in localStorage', () => {
      localStorage.setItem('active_exercises', 'corrupt-json-string');
      expect(getPersistedExercises()).toEqual([]);
    });

    it('should return empty string if no notes saved', () => {
      expect(getPersistedNotes()).toBe('');
    });

    it('should hydrate saved notes', () => {
      localStorage.setItem('workout_notes', 'Felt good today');
      expect(getPersistedNotes()).toBe('Felt good today');
    });

    it('should hydrate saved workout date or fallback to now', () => {
      const testDateString = '2026-07-07T08:11:47-07:00';
      localStorage.setItem('workout_date', testDateString);
      expect(getPersistedDate().toISOString()).toBe(new Date(testDateString).toISOString());
    });

    it('should return null for startedAt when empty', () => {
      expect(getPersistedStartedAt()).toBeNull();
    });

    it('should hydrate saved startedAt time', () => {
      const startedAtStr = '2026-07-07T08:00:00.000Z';
      localStorage.setItem('workout_started_at', startedAtStr);
      expect(getPersistedStartedAt()?.toISOString()).toBe(startedAtStr);
    });

    it('should persist and clear active session appropriately', () => {
      localStorage.setItem('active_exercises', '[]');
      localStorage.setItem('workout_notes', 'Some Notes');
      clearPersistedSession();
      expect(localStorage.getItem('active_exercises')).toBeNull();
      expect(localStorage.getItem('workout_notes')).toBeNull();
    });

    it('should get persisted session mode properly', () => {
      localStorage.setItem('active_exercises', '[{"id": "ex-1"}]');
      localStorage.setItem('session_mode', 'MANUAL');
      expect(getPersistedSessionMode('LIVE')).toBe('MANUAL');
    });
  });
});
