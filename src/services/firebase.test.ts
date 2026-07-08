import { describe, expect, it } from 'vitest';
import { handleFirestoreError, FirestoreAppError, OperationType } from './firebase';

describe('Firebase Error Handling', () => {
  it('should correctly construct FirestoreAppError with detailed metadata', () => {
    const originalError = new Error('Permission denied');
    const path = 'exercises/123';
    const operationType = OperationType.UPDATE;

    const appError = new FirestoreAppError(originalError, operationType, path);

    expect(appError).toBeInstanceOf(Error);
    expect(appError).toBeInstanceOf(FirestoreAppError);
    expect(appError.name).toBe('FirestoreAppError');
    expect(appError.message).toContain('Firestore update failed on exercises/123: Permission denied');
    expect(appError.operationType).toBe(OperationType.UPDATE);
    expect(appError.path).toBe('exercises/123');
    expect(appError.originalMessage).toBe('Permission denied');
    expect(appError.info.error).toBe('Permission denied');
    expect(appError.info.operationType).toBe(OperationType.UPDATE);
    expect(appError.info.path).toBe('exercises/123');
    expect(appError.info.authInfo).toBeDefined();
  });

  it('should correctly format JSON when serialized to JSON', () => {
    const originalError = new Error('Quota exceeded');
    const path = 'workout_templates';
    const operationType = OperationType.CREATE;

    const appError = new FirestoreAppError(originalError, operationType, path);
    const json = appError.toJSON();

    expect(json.name).toBe('FirestoreAppError');
    expect(json.message).toContain('Firestore create failed on workout_templates: Quota exceeded');
    expect(json.operationType).toBe(OperationType.CREATE);
    expect(json.path).toBe('workout_templates');
    expect(json.originalMessage).toBe('Quota exceeded');
    expect(json.info).toEqual(appError.info);
  });

  it('should throw FirestoreAppError inside handleFirestoreError', () => {
    const originalError = new Error('Simulated write failure');
    const path = 'users/abc';
    const operationType = OperationType.WRITE;

    expect(() => {
      handleFirestoreError(originalError, operationType, path);
    }).toThrow(FirestoreAppError);
  });
});
