/**
/// Фронтенд калкулации за 1RM, обем и серии, синхронизирани с бекенд логиката
/// Принципи: DRY, KISS
*/

export interface ExerciseSetItem {
  setIndex: number;
  weight?: number;
  reps?: number;
  level?: number;
  durationSeconds?: number;
  isCompleted?: boolean;
}

export function calculateEpley1RM(weight?: number, reps?: number): number {
  if (!weight || !reps || weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  return Number((weight * (1 + reps / 30)).toFixed(2));
}

export function calculateSetVolume(weight?: number, reps?: number): number {
  if (!weight || !reps || weight <= 0 || reps <= 0) return 0;
  return Number((weight * reps).toFixed(2));
}

export function normalizeSets<T extends { setIndex?: number }>(sets: T[]): T[] {
  return sets.map((set, idx) => ({
    ...set,
    setIndex: idx + 1,
  }));
}
