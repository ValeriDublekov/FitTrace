import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Workout, WorkoutExercise, ExerciseSet, Exercise } from '../types';
import { useAuth } from './useAuth';
import { workoutService } from '../services/workoutService';

export const useWorkoutSession = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeExercises, setActiveExercises] = useState<WorkoutExercise[]>(() => {
    const saved = localStorage.getItem('active_exercises');
    return saved ? JSON.parse(saved) : [];
  });
  const [workoutNotes, setWorkoutNotes] = useState(() => {
    return localStorage.getItem('workout_notes') || '';
  });
  const [workoutDate, setWorkoutDate] = useState<Date>(() => {
    const saved = localStorage.getItem('workout_date');
    return saved ? new Date(saved) : new Date();
  });
  
  // Initialize mode from URL (?mode=manual)
  const initialMode = searchParams.get('mode') === 'manual' ? 'MANUAL' : 'LIVE';
  const [sessionMode, setSessionMode] = useState<'LIVE' | 'MANUAL'>(() => {
    const saved = localStorage.getItem('session_mode');
    return (saved as 'LIVE' | 'MANUAL') || initialMode;
  });

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('active_exercises', JSON.stringify(activeExercises));
  }, [activeExercises]);

  useEffect(() => {
    localStorage.setItem('workout_notes', workoutNotes);
  }, [workoutNotes]);

  useEffect(() => {
    localStorage.setItem('workout_date', workoutDate.toISOString());
  }, [workoutDate]);

  useEffect(() => {
    localStorage.setItem('session_mode', sessionMode);
  }, [sessionMode]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [restTimerEndTime, setRestTimerEndTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('rest_timer_end_time');
    return saved ? parseInt(saved, 10) : null;
  });
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  const clearRestTimer = useCallback(() => {
    setRestTimer(null);
    setRestTimerEndTime(null);
    localStorage.removeItem('rest_timer_end_time');
  }, []);

  // Update restTimer based on restTimerEndTime
  useEffect(() => {
    if (restTimerEndTime === null) {
      setRestTimer(null);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const remainingProgress = Math.max(0, Math.ceil((restTimerEndTime - now) / 1000));
      
      if (remainingProgress <= 0) {
        setRestTimer(0); // This will trigger the sound effect in the other effect
        setRestTimerEndTime(null);
        localStorage.removeItem('rest_timer_end_time');
      } else {
        setRestTimer(remainingProgress);
      }
    };

    updateTimer(); // Initial check
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [restTimerEndTime]);

  // Handle sound feedback when restTimer hits 0
  useEffect(() => {
    if (restTimer === 0) {
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
  }, [restTimer]);

  const startRestTimer = useCallback((seconds: number = 60) => {
    // Only auto-start timer in LIVE mode
    if (sessionMode === 'MANUAL') return;
    const endTime = Date.now() + (seconds * 1000);
    setRestTimerEndTime(endTime);
    localStorage.setItem('rest_timer_end_time', endTime.toString());
    setRestTimer(seconds);
  }, [sessionMode]);

  const addExercise = useCallback(async (exercise: Exercise) => {
    if (!user) return;

    // First check if we have this exercise in the current session
    // We look for the most recent instance (last in array)
    const currentSessionInstance = [...activeExercises]
      .reverse()
      .find(ex => ex.exerciseId === exercise.id);

    let baseSets: ExerciseSet[] = [];

    if (currentSessionInstance) {
      baseSets = currentSessionInstance.sets;
    } else {
      // If not in current session, fetch from history
      const lastHistoricalSession = await workoutService.getLastExerciseSession(exercise.id!, user.uid);
      baseSets = lastHistoricalSession?.sets || [];
    }

    const setLength = 1; // Default to 1 set as requested

    const instanceId = `ex_idx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const newExercise: WorkoutExercise = {
      id: instanceId,
      exerciseId: exercise.id!,
      exerciseName: exercise.name,
      sets: Array.from({ length: setLength }, (_, i) => {
        const prevSet = baseSets[i] || baseSets[baseSets.length - 1]; 
        return {
          setIndex: i + 1,
          reps: prevSet?.reps ?? 10,
          weight: prevSet?.weight ?? 0,
          level: prevSet?.level ?? 0,
          duration: prevSet?.duration ?? 0,
          isCompleted: sessionMode === 'MANUAL'
        };
      })
    };

    setActiveExercises((prev) => [...prev, newExercise]);

    // Expand the exercise
    setExpandedExerciseId(instanceId);
  }, [sessionMode, user, activeExercises]);

  const updateSet = useCallback((id: string, setIndex: number, data: Partial<ExerciseSet>) => {
    setActiveExercises((prev) => prev.map(ex => {
      if (ex.id !== id) return ex;
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

  const addSet = useCallback((id: string) => {
    setActiveExercises((prev) => prev.map(ex => {
      if (ex.id !== id) return ex;
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

  const removeSet = useCallback((id: string, setIndex: number) => {
    setActiveExercises((prev) => prev.map(ex => {
      if (ex.id !== id) return ex;
      return {
        ...ex,
        sets: ex.sets.filter(s => s.setIndex !== setIndex).map((s, i) => ({ ...s, setIndex: i + 1 }))
      };
    }));
  }, []);

  const markExerciseAsCompleted = useCallback((id: string) => {
    setActiveExercises((prev) => prev.map(ex => {
      if (ex.id !== id) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => ({ ...s, isCompleted: true }))
      };
    }));
  }, []);

  const removeIncompleteSets = useCallback((id: string) => {
    setActiveExercises((prev) => {
      const nextExercises = prev.map(ex => {
        if (ex.id !== id) return ex;
        
        const completedSets = ex.sets.filter(s => s.isCompleted);
        
        return {
          ...ex,
          sets: completedSets.map((s, i) => ({ ...s, setIndex: i + 1 }))
        };
      });

      return nextExercises.filter(ex => ex.id !== id || ex.sets.length > 0);
    });
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
          const filteredSets = ex.sets.filter(s => {
            const hasData = (s.reps !== undefined && s.reps > 0) || 
                            (s.weight !== undefined && s.weight > 0) || 
                            (s.level !== undefined && s.level > 0) || 
                            (s.duration !== undefined && s.duration > 0);
            
            if (sessionMode === 'LIVE') return s.isCompleted && hasData;
            return hasData;
          });

          return {
            ...ex,
            sets: filteredSets
          };
        }).filter(ex => ex.sets.length > 0)
      };

      if (workout.exercises.length === 0) {
        clearSession();
        return true;
      }

      await workoutService.saveWorkout(workout);
      clearSession();
      return true;
    } catch (error) {
      console.error('Error saving workout:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [user, activeExercises, workoutNotes, workoutDate, sessionMode]);

  const clearSession = useCallback(() => {
    setActiveExercises([]);
    setWorkoutNotes('');
    setWorkoutDate(new Date());
    setSessionMode('LIVE');
    setExpandedExerciseId(null);
    localStorage.removeItem('active_exercises');
    localStorage.removeItem('workout_notes');
    localStorage.removeItem('workout_date');
    localStorage.removeItem('session_mode');
  }, []);

  const removeExercise = useCallback((id: string) => {
    setActiveExercises((prev) => prev.filter(ex => ex.id !== id));
    if (expandedExerciseId === id) {
      setExpandedExerciseId(null);
    }
  }, [expandedExerciseId]);

  return {
    activeExercises,
    workoutNotes,
    setWorkoutNotes,
    workoutDate,
    setWorkoutDate,
    sessionMode,
    setSessionMode,
    addExercise,
    removeExercise,
    updateSet,
    addSet,
    removeSet,
    finishWorkout,
    markExerciseAsCompleted,
    removeIncompleteSets,
    isSaving,
    restTimer,
    expandedExerciseId,
    setExpandedExerciseId,
    startRestTimer,
    clearRestTimer
  };
};
