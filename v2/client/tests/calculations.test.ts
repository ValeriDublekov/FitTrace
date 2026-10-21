import { describe, it, expect } from 'vitest';
import { calculateEpley1RM, calculateSetVolume, normalizeSets } from '../src/utils/calculations';

describe('Frontend V2 Calculations & Normalization Tests', () => {
  it('calculates 1RM accurately using Epley formula', () => {
    expect(calculateEpley1RM(100, 1)).toBe(100);
    expect(calculateEpley1RM(100, 10)).toBe(133.33);
    expect(calculateEpley1RM(80, 5)).toBe(93.33);
    expect(calculateEpley1RM(0, 5)).toBe(0);
    expect(calculateEpley1RM(100, 0)).toBe(0);
  });

  it('calculates set volume correctly', () => {
    expect(calculateSetVolume(100, 5)).toBe(500);
    expect(calculateSetVolume(62.5, 8)).toBe(500);
    expect(calculateSetVolume(undefined, 8)).toBe(0);
    expect(calculateSetVolume(100, undefined)).toBe(0);
  });

  it('normalizes set indexes starting from 1 sequentially', () => {
    const rawSets = [
      { setIndex: 10, weight: 100, reps: 5 },
      { setIndex: 50, weight: 100, reps: 5 },
      { setIndex: 99, weight: 100, reps: 5 },
    ];

    const normalized = normalizeSets(rawSets);
    expect(normalized).toHaveLength(3);
    expect(normalized[0].setIndex).toBe(1);
    expect(normalized[1].setIndex).toBe(2);
    expect(normalized[2].setIndex).toBe(3);
  });
});
