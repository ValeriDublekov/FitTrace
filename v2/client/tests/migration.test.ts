import { describe, it, expect } from 'vitest';
import { transformFirestoreToSql, FirestoreDump } from '../../tools/migration/migrate';

describe('Firestore to PostgreSQL Migration Tool Tests', () => {
  it('correctly transforms exercises, workouts, and nested sets into relational SQL', () => {
    const mockDump: FirestoreDump = {
      exercises: [
        {
          id: 'ex_bench_123',
          name: "Bench Press",
          category: 'Chest',
          loadType: 'WEIGHT_REPS',
          isCustom: false,
          defaultNotes: 'Touch chest'
        }
      ],
      workouts: [
        {
          id: 'workout_abc',
          userId: 'user_1',
          date: '2026-10-21T10:00:00.000Z',
          durationSeconds: 3600,
          notes: 'Great chest workout',
          exercises: [
            {
              id: 'session_ex_1',
              exerciseId: 'ex_bench_123',
              sets: [
                { setIndex: 1, weight: 80, reps: 10, isCompleted: true },
                { setIndex: 2, weight: 90, reps: 8, isCompleted: true }
              ]
            }
          ]
        }
      ]
    };

    const sql = transformFirestoreToSql(mockDump, '00000000-0000-0000-0000-000000000001');

    expect(sql).toContain('BEGIN TRANSACTION;');
    expect(sql).toContain('COMMIT;');
    expect(sql).toContain('INSERT INTO users');
    expect(sql).toContain('INSERT INTO exercises');
    expect(sql).toContain('Bench Press');
    expect(sql).toContain('INSERT INTO workouts');
    expect(sql).toContain('INSERT INTO workout_exercises');
    expect(sql).toContain('INSERT INTO exercise_sets');
    expect(sql).toContain('80');
    expect(sql).toContain('90');
  });
});
