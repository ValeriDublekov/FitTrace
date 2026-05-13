import { useState, useCallback, useEffect } from 'react';
import { STORAGE_KEYS } from '../../../constants';
import { playNotificationSound } from '../../../utils/audioUtils';

export const useWorkoutRestTimer = (sessionMode: 'LIVE' | 'MANUAL') => {
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [restTimerEndTime, setRestTimerEndTime] = useState<number | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REST_TIMER_END_TIME);
    return saved ? parseInt(saved, 10) : null;
  });

  const clearRestTimer = useCallback(() => {
    setRestTimer(null);
    setRestTimerEndTime(null);
    localStorage.removeItem(STORAGE_KEYS.REST_TIMER_END_TIME);
  }, []);

  const startRestTimer = useCallback((seconds: number = 60) => {
    // Only auto-start timer in LIVE mode
    if (sessionMode === 'MANUAL') return;
    const endTime = Date.now() + (seconds * 1000);
    setRestTimerEndTime(endTime);
    localStorage.setItem(STORAGE_KEYS.REST_TIMER_END_TIME, endTime.toString());
    setRestTimer(seconds);
  }, [sessionMode]);

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
        // Trigger completion
        setRestTimer(0);
        setRestTimerEndTime(null);
        localStorage.removeItem(STORAGE_KEYS.REST_TIMER_END_TIME);
      } else {
        setRestTimer(remainingProgress);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [restTimerEndTime]);

  // Handle sound feedback when restTimer hits 0
  useEffect(() => {
    if (restTimer === 0) {
      setRestTimer(null);
      playNotificationSound();
    }
  }, [restTimer]);

  return {
    restTimer,
    startRestTimer,
    clearRestTimer
  };
};
