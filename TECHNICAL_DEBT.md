# Technical Debt - FitTrace Fitness Tracker

This document tracks coding patterns, architectural issues, and technical debt that needs resolution to maintain adherence to the project guidelines defined in `AGENTS.md`.

## 1. File Size Violations (Limit: 200 lines)

The following files exceed the 200-line limit and should be refactored into smaller components or utility functions:

- **`src/pages/ProgressPage.tsx` (~415 lines):** Largest file in the project. Manages heavy visualization logic, global history, and exercise-specific history in one place.
- **`src/hooks/useWorkoutSession.ts` (~334 lines):** This hook handles too many responsibilities including state management, localStorage persistence, rest timer logic, and audio feedback.
- **`src/features/workout/components/ExerciseLogger.tsx` (~238 lines):** Contains dense logic for history viewing and individual set logging.
- **`src/features/workout/components/ActiveSession.tsx` (~213 lines):** Manages the entire session list and completion logic.

## 2. Architectural Concerns

- **Separation of Concerns (Hooks):** `useWorkoutSession` is effectively a monolithic hook. It should be split into smaller, focused hooks (e.g., `useRestTimer`, `useWorkoutPersistence`, `useWorkoutState`).
- **Logic in Components:** `ExerciseLogger.tsx` and `ProgressPage.tsx` contain significant data mapping and historical data rendering. This should be moved to sub-components or descriptive helper components.
- **Audio Logic:** The Web Audio API implementation inside `useWorkoutSession` is an implementation detail that should be extracted to a utility function (`utils/audio.ts`) or a dedicated hook.
- **Mobile Optimized Navigation:** `AGENTS.md` mentions a "bottom nav", but the app currently uses a `Navbar` top bar. A true bottom navigation bar would better suit an Android PWA experience.

## 3. Code Quality

- **LocalStorage Keys:** Multiple hardcoded strings for localStorage keys are used across the `useWorkoutSession` hook. These should be moved to a `constants.ts` file.
- **Strict Typing:** While most things are typed, some areas (like audio context) use `as any` or have loose types that could be hardened.
- **Redundant Logic:** `ProgressPage.tsx` contains redundant ternary operations (line 96).

## 4. Performance

- **Historical Data Filtering:** `workoutService.getExerciseHistory` fetches up to 100 workouts and filters them in memory. As the history grows, this might need a more optimized Firestore query using indexes if possible, though current implementation is a safe fallback for dynamic exercises.
