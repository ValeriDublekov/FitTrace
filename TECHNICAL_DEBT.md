# Technical Debt - FitTrace Fitness Tracker

This document tracks coding patterns, architectural issues, and technical debt that needs resolution to maintain adherence to the project guidelines defined in `AGENTS.md`.

## 1. File Size Violations (Limit: 200 lines)

The following files exceed the 200-line limit and should be refactored into smaller components or utility functions:

- **`src/pages/ProgressPage.tsx` [DONE]**
- **`src/hooks/useWorkoutSession.ts` [DONE]**
- **`src/features/workout/components/ExerciseLogger.tsx` [DONE]**
- **`src/features/workout/components/ActiveSession.tsx` [DONE]**

## 2. Architectural Concerns

- **Separation of Concerns (Hooks): [DONE]** `useWorkoutSession` was refactored into smaller pieces.
- **Logic in Components: [DONE]** Extracted sub-components for `ExerciseLogger.tsx` and `ProgressPage.tsx`.
- **Audio Logic: [DONE]** Extracted to `src/utils/audioUtils.ts`.
- **LocalStorage Keys: [DONE]** Moved to `src/constants/index.ts`.
- **Mobile Optimized Navigation:** `AGENTS.md` mentions a "bottom nav", but the app currently uses a `Navbar` top bar. A true bottom navigation bar would better suit an Android PWA experience.

## 3. Code Quality

- **LocalStorage Keys:** Multiple hardcoded strings for localStorage keys are used across the `useWorkoutSession` hook. These should be moved to a `constants.ts` file.
- **Strict Typing:** While most things are typed, some areas (like audio context) use `as any` or have loose types that could be hardened.
- **Redundant Logic:** `ProgressPage.tsx` contains redundant ternary operations (line 96).

## 4. Performance

- **Historical Data Filtering:** `workoutService.getExerciseHistory` fetches up to 100 workouts and filters them in memory. As the history grows, this might need a more optimized Firestore query using indexes if possible, though current implementation is a safe fallback for dynamic exercises.
