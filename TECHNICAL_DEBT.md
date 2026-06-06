# Technical Debt

## Open

- **Exercise queries are not rule-safe**
  - *Context*: Custom and global exercises are queried in parallel. Client filters must align perfectly with Firestore rules (`userId == auth.uid` vs. `userId == null`), otherwise permission failures occur when loading the catalogs.
- **App-wide data is duplicated across hooks**
  - *Context*: Global user settings, preferences, and static catalogs are independently fetched or subscribed to in several divergent hooks (e.g., `useUserSettings`, `useAppSettings`) instead of cleanly pulling from `AppDataProvider` cache.
- **Workout session context is too broad**
  - *Context*: `WorkoutSessionContext` holds both high-frequency state (the ticking stopwatch timer and rest alerts) and low-frequency structures (active lists, exercise notes). This forces total-hierarchy rerenders of idle card controls on every stopwatch second update.
- **Progress derivations are split across live and one-shot hooks**
  - *Context*: Progress history graphs and max-weight calculations parse completed sessions from two conflicting sources: the active live subscriptions (`useWorkoutHistory`) and manual one-shot service queries (`useExerciseHistory`), risking rendering latency shifts and data mismatches.
- **Tooling drift**
  - *Context*: Environmental builds differ from production deployment standards. Paths depend on relative base parameters (such as the fallback `/FitTrace/`), creating dependency mapping risks.
- **Docs are drifting without a single source of truth**
  - *Context*: Standard definitions and operational blueprints are dispersed across several distinct markdown notes (e.g. `TECHNICAL_DEBT.md`, `ARCHITECTURE.md`), introducing a high risk of documentation decay.

## Closed

Only items that are demonstrably fixed and validated:

- **Mobile bottom navigation implementation**: Verified. A standard responsive touch-optimized `BottomNav.tsx` toolbar has been established for small viewports.
- **Audio utility extraction**: Verified. All ringers and sound pre-loading behaviors are encapsulated strictly inside `/src/utils/audioUtils.ts`.
- **LocalStorage key standardization**: Verified. Handlers are linked to a single central vocabulary of parameters defined in `src/constants/index.ts`.
- **Strict code size constraints (< 200 lines)**: Verified. Overly complex structures (such as `ProgressPage.tsx`, `useWorkoutSession.ts`, and `ActiveSession.tsx`) have been refactored and extracted into dedicated component files.
