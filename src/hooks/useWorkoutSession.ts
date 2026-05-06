import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Workout, WorkoutExercise, ExerciseSet, Exercise } from '../types';
import { useAuth } from './useAuth';
import { workoutService } from '../services/workoutService';

export const useWorkoutSession = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeExercises, setActiveExercises] = useState<WorkoutExercise[]>([]);
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [workoutDate, setWorkoutDate] = useState<Date>(new Date());
  
  // Initialize mode from URL (?mode=manual)
  const initialMode = searchParams.get('mode') === 'manual' ? 'MANUAL' : 'LIVE';
  const [sessionMode, setSessionMode] = useState<'LIVE' | 'MANUAL'>(initialMode);
  
  const [isSaving, setIsSaving] = useState(false);
  const [restTimer, setRestTimer] = useState<number | null>(null);

  const clearRestTimer = useCallback(() => {
    setRestTimer(null);
  }, []);

  // ... rest timer logic ...
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (restTimer !== null && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
      }, 1000);
    } else if (restTimer === 0) {
      setRestTimer(null);
      // Play light sound notification
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.type = 'sine'; // Lighter sound
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // Higher pitch, cleaner
        oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.05); // Fade in
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3); // Fade out
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
      } catch (e) {
        console.warn('Audio feedback failed', e);
      }
    }
    return () => clearInterval(interval);
  }, [restTimer]);

  const startRestTimer = useCallback((seconds: number = 60) => {
    // Only auto-start timer in LIVE mode
    if (sessionMode === 'MANUAL') return;
    setRestTimer(seconds);
  }, [sessionMode]);

  const addExercise = useCallback(async (exercise: Exercise) => {
    if (!user) return;

    const lastSession = await workoutService.getLastExerciseSession(exercise.id!, user.uid);

    setActiveExercises((prev) => {
      // Check if already added
      if (prev.find(e => e.exerciseId === exercise.id)) return prev;

      const baseSets = lastSession?.sets || [];
      const setLength = Math.max(baseSets.length, 3);

      const newExercise: WorkoutExercise = {
        exerciseId: exercise.id!,
        exerciseName: exercise.name,
        sets: Array.from({ length: setLength }, (_, i) => {
          const prevSet = baseSets[i] || baseSets[baseSets.length - 1]; // Use last set if we have fewer history sets than current
          return {
            setIndex: i + 1,
            reps: prevSet?.reps ?? 10,
            weight: prevSet?.weight ?? 0,
            level: prevSet?.level ?? 0,
            duration: prevSet?.duration ?? 0,
            // In MANUAL mode, sets are pre-completed (user is filling in what they DID)
            isCompleted: sessionMode === 'MANUAL'
          };
        })
      };
      return [...prev, newExercise];
    });
  }, [sessionMode, user]);

  const updateSet = useCallback((exerciseId: string, setIndex: number, data: Partial<ExerciseSet>) => {
    setActiveExercises((prev) => prev.map(ex => {
      if (ex.exerciseId !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => {
          if (s.setIndex !== setIndex) return s;
          const updatedSet = { ...s, ...data };
          
          // If marking as completed for the first time, start timer
          if (data.isCompleted && !s.isCompleted && sessionMode === 'LIVE') {
            startRestTimer();
          }
          
          return updatedSet;
        })
      };
    }));
  }, [startRestTimer, sessionMode]);

  const addSet = useCallback((exerciseId: string) => {
    setActiveExercises((prev) => prev.map(ex => {
      if (ex.exerciseId !== exerciseId) return ex;
      const nextIndex = ex.sets.length + 1;
      const lastSet = ex.sets[ex.sets.length - 1];
      return {
        ...ex,
        sets: [...ex.sets, { 
          setIndex: nextIndex, 
          reps: lastSet?.reps ?? 10,
          weight: lastSet?.weight ?? 0,
          level: lastSet?.level ?? 0,
          duration: lastSet?.duration ?? 0,
          isCompleted: sessionMode === 'MANUAL' // Pre-complete in manual mode
        }]
      };
    }));
  }, [sessionMode]);

  const removeSet = useCallback((exerciseId: string, setIndex: number) => {
    setActiveExercises((prev) => prev.map(ex => {
      if (ex.exerciseId !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.filter(s => s.setIndex !== setIndex).map((s, i) => ({ ...s, setIndex: i + 1 }))
      };
    }));
  }, []);

  const finishWorkout = useCallback(async () => {
    if (!user || activeExercises.length === 0) return;
    
    setIsSaving(true);
    try {
      const workout: Omit<Workout, 'id'> = {
        userId: user.uid,
        date: workoutDate,
        notes: workoutNotes,
        exercises: activeExercises.map(ex => {
          // In manual mode, we also want to make sure the set has some data logged
          // before we save it, otherwise we'd save a lot of empty sets.
          const filteredSets = ex.sets.filter(s => {
            const hasData = (s.reps !== undefined && s.reps > 0) || 
                            (s.weight !== undefined && s.weight > 0) || 
                            (s.level !== undefined && s.level > 0) || 
                            (s.duration !== undefined && s.duration > 0);
            
            if (sessionMode === 'LIVE') return s.isCompleted && hasData;
            return hasData; // In manual mode, just check if it has data
          });

          return {
            ...ex,
            sets: filteredSets
          };
        }).filter(ex => ex.sets.length > 0) // Only save exercises with valid sets
      };

      if (workout.exercises.length === 0) {
        setActiveExercises([]);
        setWorkoutNotes('');
        setWorkoutDate(new Date());
        setSessionMode('LIVE');
        return true;
      }

      await workoutService.saveWorkout(workout);
      setActiveExercises([]);
      setWorkoutNotes('');
      setWorkoutDate(new Date());
      setSessionMode('LIVE'); // Reset to default
      return true;
    } catch (error) {
      console.error('Error saving workout:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [user, activeExercises, workoutNotes, workoutDate, sessionMode]);

  return {
    activeExercises,
    workoutNotes,
    setWorkoutNotes,
    workoutDate,
    setWorkoutDate,
    sessionMode,
    setSessionMode,
    addExercise,
    updateSet,
    addSet,
    removeSet,
    finishWorkout,
    isSaving,
    restTimer,
    startRestTimer,
    clearRestTimer
  };
};
