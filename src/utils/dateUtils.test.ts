import { describe, expect, it } from 'vitest';
import { formatDuration } from './dateUtils';

describe('formatDuration', () => {
  it('should return null for undefined, zero, or negative seconds', () => {
    expect(formatDuration(undefined)).toBeNull();
    expect(formatDuration(0)).toBeNull();
    expect(formatDuration(-15)).toBeNull();
  });

  it('should format seconds only when under a minute', () => {
    expect(formatDuration(45)).toBe('45s');
    expect(formatDuration(5)).toBe('5s');
  });

  it('should format minutes and seconds when under an hour', () => {
    expect(formatDuration(60)).toBe('1m 0s');
    expect(formatDuration(125)).toBe('2m 5s');
  });

  it('should format hours and minutes when over an hour', () => {
    expect(formatDuration(3600)).toBe('1h 0m');
    expect(formatDuration(3665)).toBe('1h 1m');
    expect(formatDuration(7320)).toBe('2h 2m');
  });
});
