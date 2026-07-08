# Technical Debt

## Open

- **App-wide data is duplicated across hooks**
  - *Context*: Global user settings, preferences, and static catalogs are independently fetched or subscribed to in several divergent hooks (e.g., `useUserSettings`, `useAppSettings`) instead of cleanly pulling from `AppDataProvider` cache.
- **Workout session context is too broad**
  - *Context*: `WorkoutSessionContext` holds both high-frequency state (the ticking stopwatch timer and rest alerts) and low-frequency structures (active lists, exercise notes). This forces total-hierarchy rerenders of idle card controls on every stopwatch second update.
- **Tooling drift**
  - *Context*: Environmental builds differ from production deployment standards. Paths depend on relative base parameters (such as the fallback `/FitTrace/`), creating dependency mapping risks.
- **Docs are drifting without a single source of truth**
  - *Context*: Standard definitions and operational blueprints are dispersed across several distinct markdown notes (e.g. `TECHNICAL_DEBT.md`, `ARCHITECTURE.md`), introducing a high risk of documentation decay.
- **Testing gaps**
  - *Context*: Comprehensive test coverage is lacking for core business logic and critical UI paths.
- **Strict TypeScript adoption**
  - *Context*: Some areas of the codebase may still rely on loose types or type assertions that should be hardened.

## Closed

Only items that are demonstrably fixed and validated:

- **Exercise rule-safe reads**: Verified. Custom and global exercises are safely queried in parallel using separate, rule-compliant queries in `exerciseService.getExercises()`.
- **Reactive exercise history**: Verified. `useExerciseHistory` cleanly derives its state from the active live subscriptions in `useWorkoutHistoryStore()`, resolving rendering latency shifts and data mismatches.
- **Mobile bottom navigation implementation**: Verified. A standard responsive touch-optimized `BottomNav.tsx` toolbar has been established for small viewports.
- **Audio utility extraction**: Verified. All ringers and sound pre-loading behaviors are encapsulated strictly inside `/src/utils/audioUtils.ts`.
- **LocalStorage key standardization**: Verified. Handlers are linked to a single central vocabulary of parameters defined in `src/constants/index.ts`.
- **Strict code size constraints (< 200 lines)**: Verified. Overly complex structures (such as `ProgressPage.tsx`, `useWorkoutSession.ts`, and `ActiveSession.tsx`) have been refactored and extracted into dedicated component files.
