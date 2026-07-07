import { describe, expect, it, vi } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import { 
  cleanUndefined, 
  normalizeExerciseCreatePayload, 
  normalizeExerciseUpdatePayload,
  ExerciseCreateInput
} from '../types';

// Mock simple timestamp class for the rule simulator
class MockTimestamp {
  constructor(public seconds: number, public nanoseconds: number) {}
}

/**
 * Simulates the firestore.rules logic for `isValidUserSettings`
 * to verify our client-side payloads will pass rules assertions.
 */
function simulateIsValidUserSettings(settings: any): boolean {
  if (!settings || typeof settings !== 'object') return false;
  
  const keys = Object.keys(settings);
  
  // return settings.keys().hasAll(['updatedAt'])
  if (!keys.includes('updatedAt')) return false;
  
  // && settings.updatedAt is timestamp
  const updatedAt = settings.updatedAt;
  const isTimestamp = updatedAt instanceof Date || 
                      updatedAt instanceof Timestamp || 
                      updatedAt instanceof MockTimestamp ||
                      (updatedAt && typeof updatedAt === 'object' && 'seconds' in updatedAt);
  if (!isTimestamp) return false;
  
  // && (!('fontSize' in settings) || settings.fontSize in ['normal', 'large', 'xlarge'])
  if ('fontSize' in settings) {
    if (!['normal', 'large', 'xlarge'].includes(settings.fontSize)) return false;
  }
  
  // && (!('language' in settings) || settings.language in ['bg', 'en'])
  if ('language' in settings) {
    if (!['bg', 'en'].includes(settings.language)) return false;
  }
  
  // && (!('notificationSound' in settings) || (settings.notificationSound is string && settings.notificationSound.size() <= 200))
  if ('notificationSound' in settings) {
    if (typeof settings.notificationSound !== 'string' || settings.notificationSound.length > 200) {
      return false;
    }
  }
  
  // && (!('isNotificationsEnabled' in settings) || settings.isNotificationsEnabled is bool)
  if ('isNotificationsEnabled' in settings) {
    if (typeof settings.isNotificationsEnabled !== 'boolean') return false;
  }
  
  // Ensure only allowed fields are present (no other keys)
  let allowedCount = 0;
  if ('fontSize' in settings) allowedCount++;
  if ('language' in settings) allowedCount++;
  if ('notificationSound' in settings) allowedCount++;
  if ('isNotificationsEnabled' in settings) allowedCount++;
  if ('updatedAt' in settings) allowedCount++;
  
  return allowedCount === keys.length;
}

describe('Firestore Payloads & Rules Helpers', () => {
  describe('User Settings Updates & Rules Simulator', () => {
    it('should pass validation for each valid single partial setting update', () => {
      const now = new Date();

      const fontSizeUpdate = { fontSize: 'large', updatedAt: now };
      const languageUpdate = { language: 'en', updatedAt: now };
      const soundUpdate = { notificationSound: 'happy_bells', updatedAt: now };
      const notificationUpdate = { isNotificationsEnabled: false, updatedAt: now };

      expect(simulateIsValidUserSettings(fontSizeUpdate)).toBe(true);
      expect(simulateIsValidUserSettings(languageUpdate)).toBe(true);
      expect(simulateIsValidUserSettings(soundUpdate)).toBe(true);
      expect(simulateIsValidUserSettings(notificationUpdate)).toBe(true);
    });

    it('should pass validation for combined partial updates', () => {
      const now = new Date();
      const combinedUpdate = {
        fontSize: 'xlarge',
        language: 'bg',
        isNotificationsEnabled: true,
        updatedAt: now
      };
      expect(simulateIsValidUserSettings(combinedUpdate)).toBe(true);
    });

    it('should fail validation if updatedAt is missing', () => {
      const invalidUpdate = { fontSize: 'normal' };
      expect(simulateIsValidUserSettings(invalidUpdate)).toBe(false);
    });

    it('should fail validation if an unexpected field is included', () => {
      const invalidUpdate = { 
        fontSize: 'normal', 
        updatedAt: new Date(), 
        theme: 'dark' // extra unexpected key
      };
      expect(simulateIsValidUserSettings(invalidUpdate)).toBe(false);
    });

    it('should fail validation for invalid option values or types', () => {
      const now = new Date();
      
      // Invalid fontSize
      expect(simulateIsValidUserSettings({ fontSize: 'huge', updatedAt: now })).toBe(false);
      
      // Invalid language
      expect(simulateIsValidUserSettings({ language: 'fr', updatedAt: now })).toBe(false);
      
      // Invalid notificationSound length
      const superLongSound = 'a'.repeat(201);
      expect(simulateIsValidUserSettings({ notificationSound: superLongSound, updatedAt: now })).toBe(false);
      
      // Invalid isNotificationsEnabled type
      expect(simulateIsValidUserSettings({ isNotificationsEnabled: 'true', updatedAt: now })).toBe(false);
    });
  });

  describe('Exercise Payload Normalization', () => {
    const mockExerciseInput: ExerciseCreateInput = {
      name: 'Bench Press',
      category: 'chest',
      loadType: 'WEIGHT_REPS',
      description: 'Standard flat bench press',
      isCustom: false,
    };

    it('should normalize global exercises correctly in adminMode', () => {
      const normalized = normalizeExerciseCreatePayload(mockExerciseInput, true, 'admin-uid');
      expect(normalized.isCustom).toBe(false);
      expect(normalized.userId).toBeUndefined();
    });

    it('should normalize user-custom exercises correctly when not in adminMode', () => {
      const normalized = normalizeExerciseCreatePayload(mockExerciseInput, false, 'user-uid');
      expect(normalized.isCustom).toBe(true);
      expect(normalized.userId).toBe('user-uid');
    });

    it('should handle undefined userId correctly in non-adminMode', () => {
      const normalized = normalizeExerciseCreatePayload(mockExerciseInput, false, undefined);
      expect(normalized.isCustom).toBe(true);
      expect(normalized.userId).toBeUndefined();
    });

    it('should update payloads correctly using normalizeExerciseUpdatePayload', () => {
      const updates = { name: 'Incline Bench Press' };
      const normalized = normalizeExerciseUpdatePayload(updates, false, 'user-uid');
      expect(normalized.isCustom).toBe(true);
      expect(normalized.userId).toBe('user-uid');
      expect(normalized.name).toBe('Incline Bench Press');
    });
  });

  describe('cleanUndefined Serialization Helper', () => {
    it('should strip undefined fields but preserve null and valid values', () => {
      const input = {
        name: 'Deadlift',
        notes: undefined,
        weight: null,
        reps: 5,
        isActive: true,
      };

      const result = cleanUndefined(input);
      expect(result).toEqual({
        name: 'Deadlift',
        weight: null,
        reps: 5,
        isActive: true,
      });
      expect(result).not.toHaveProperty('notes');
    });

    it('should clean nested objects recursively', () => {
      const input = {
        exerciseId: 'ex123',
        settings: {
          tempo: '3-0-1-0',
          rest: undefined,
          advanced: {
            rpe: undefined,
            dropset: false,
          }
        }
      };

      const result = cleanUndefined(input);
      expect(result).toEqual({
        exerciseId: 'ex123',
        settings: {
          tempo: '3-0-1-0',
          advanced: {
            dropset: false,
          }
        }
      });
    });

    it('should clean elements in arrays recursively', () => {
      const input = {
        exercises: [
          { id: '1', note: undefined },
          { id: '2', note: 'some note' }
        ]
      };

      const result = cleanUndefined(input);
      expect(result).toEqual({
        exercises: [
          { id: '1' },
          { id: '2', note: 'some note' }
        ]
      });
    });

    it('should leave Date and Firestore objects untouched', () => {
      const now = new Date();
      const input = {
        date: now,
        timestamp: Timestamp.fromDate(now),
        optionalField: undefined
      };

      const result = cleanUndefined(input);
      expect(result.date).toBe(now);
      expect(result.timestamp).toBeInstanceOf(Timestamp);
      expect(result).not.toHaveProperty('optionalField');
    });
  });
});
