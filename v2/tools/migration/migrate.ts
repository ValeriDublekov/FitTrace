/**
 * FitTrace v1 (Firestore) to v2 (PostgreSQL) Migration Tool
 * 
 * Този скрипт чете съществуващите Firestore документи и генерира:
 * 1. firestore-export.json (пълен бекъп на оригиналните данни)
 * 2. pg-seed.sql (чист релационен SQL транзакционен скрипт за директно вливане в PostgreSQL)
 */

import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

export interface FirestoreExercise {
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
  createdAt?: string | { _seconds: number };
}

export interface FirestoreSet {
  setIndex: number;
  weight?: number;
  reps?: number;
  level?: number;
  duration?: number;
  isCompleted?: boolean;
}

export interface FirestoreWorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName?: string;
  sessionNotes?: string;
  supersetGroupId?: string;
  sets: FirestoreSet[];
}

export interface FirestoreWorkout {
  id: string;
  userId: string;
  date: string | { _seconds: number };
  startedAt?: string | { _seconds: number };
  durationSeconds?: number;
  notes?: string;
  exercises: FirestoreWorkoutExercise[];
}

export interface FirestoreDump {
  exercises: FirestoreExercise[];
  workouts: FirestoreWorkout[];
}

export function transformFirestoreToSql(dump: FirestoreDump, defaultUserId: string = uuidv4()): string {
  const sqlStatements: string[] = [];
  const exerciseIdMap = new Map<string, string>(); // oldId -> newGuid

  sqlStatements.push('-- FitTrace v1 -> v2 Data Migration Script');
  sqlStatements.push('BEGIN TRANSACTION;\n');

  // 1. Потребител
  sqlStatements.push(`-- 1. Default Migrated User`);
  sqlStatements.push(`INSERT INTO users (id, email, password_hash, role, created_at)
VALUES ('${defaultUserId}', 'migrated-user@fittrace.local', 'REPLACE_WITH_REAL_HASH_OR_USE_AUTH', 'User', NOW())
ON CONFLICT (id) DO NOTHING;\n`);

  // 2. Упражнения
  sqlStatements.push(`-- 2. Exercises`);
  for (const ex of dump.exercises) {
    const newGuid = uuidv4();
    exerciseIdMap.set(ex.id, newGuid);

    const isCustom = ex.isCustom ?? false;
    const userFk = isCustom ? `'${defaultUserId}'` : 'NULL';
    const name = ex.name.replace(/'/g, "''");
    const category = ex.category.replace(/'/g, "''");
    const affectedPart = ex.affectedPart ? `'${ex.affectedPart.replace(/'/g, "''")}'` : 'NULL';
    const notes = ex.defaultNotes ? `'${ex.defaultNotes.replace(/'/g, "''")}'` : 'NULL';

    sqlStatements.push(`INSERT INTO exercises (id, name, category, load_type, affected_part, default_notes, is_custom, user_id, created_at)
VALUES ('${newGuid}', '${name}', '${category}', '${ex.loadType}', ${affectedPart}, ${notes}, ${isCustom}, ${userFk}, NOW());`);
  }
  sqlStatements.push('');

  // 3. Тренировки, WorkoutExercises и ExerciseSets
  sqlStatements.push(`-- 3. Workouts, Exercises and Sets`);
  for (const workout of dump.workouts) {
    const workoutGuid = uuidv4();
    const dateStr = parseDate(workout.date);
    const notes = workout.notes ? `'${workout.notes.replace(/'/g, "''")}'` : 'NULL';
    const duration = workout.durationSeconds ?? 'NULL';

    sqlStatements.push(`INSERT INTO workouts (id, user_id, date, duration_seconds, notes, created_at)
VALUES ('${workoutGuid}', '${defaultUserId}', '${dateStr}', ${duration}, ${notes}, NOW());`);

    let exerciseOrder = 1;
    for (const we of workout.exercises || []) {
      const weGuid = uuidv4();
      const mappedExerciseId = exerciseIdMap.get(we.exerciseId);

      if (!mappedExerciseId) {
        continue; // Пропуска се, ако упражнението не съществува
      }

      const sessionNotes = we.sessionNotes ? `'${we.sessionNotes.replace(/'/g, "''")}'` : 'NULL';
      const supersetId = we.supersetGroupId ? `'${we.supersetGroupId}'` : 'NULL';

      sqlStatements.push(`  INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, session_notes, superset_group_id)
  VALUES ('${weGuid}', '${workoutGuid}', '${mappedExerciseId}', ${exerciseOrder++}, ${sessionNotes}, ${supersetId});`);

      let setIdx = 1;
      for (const set of we.sets || []) {
        const setGuid = uuidv4();
        const weight = set.weight !== undefined ? set.weight : 'NULL';
        const reps = set.reps !== undefined ? set.reps : 'NULL';
        const level = set.level !== undefined ? set.level : 'NULL';
        const isCompleted = set.isCompleted !== false;

        sqlStatements.push(`    INSERT INTO exercise_sets (id, workout_exercise_id, set_index, weight, reps, level, is_completed)
    VALUES ('${setGuid}', '${weGuid}', ${setIdx++}, ${weight}, ${reps}, ${level}, ${isCompleted});`);
      }
    }
  }

  sqlStatements.push('\nCOMMIT;');
  return sqlStatements.join('\n');
}

function parseDate(val: string | { _seconds: number } | undefined): string {
  if (!val) return new Date().toISOString();
  if (typeof val === 'string') return new Date(val).toISOString();
  if (typeof val === 'object' && '_seconds' in val) {
    return new Date(val._seconds * 1000).toISOString();
  }
  return new Date().toISOString();
}
