# PROJECT REFLECTION & ATOMIC EXECUTION PLAN

## SECTION 1: Architectural & Documentation Gaps (Summary)

### Code Health Summary

- Remote state ownership is fragmented. Auth-adjacent data such as admin status, app settings, user settings, exercise catalog data, and workout history are fetched independently by multiple hooks and multiple screens instead of being owned once and reused.
- The exercise data access pattern is structurally unsafe against the current Firestore rules. [src/services/exerciseService.ts](src/services/exerciseService.ts) queries the entire `exercises` collection and filters client-side, while [firestore.rules](firestore.rules) only allows reading global exercises plus the current user’s custom exercises. As soon as multiple users have custom exercises, unrestricted collection queries are likely to fail.
- The workout session context is too broad. [src/hooks/useWorkoutSession.ts](src/hooks/useWorkoutSession.ts) mixes persistence, session mutations, URL-mode negotiation, save orchestration, and timer coordination into one large state surface, then [src/features/workout/context/WorkoutSessionContext.tsx](src/features/workout/context/WorkoutSessionContext.tsx) exposes the whole object as one context value. This guarantees avoidable rerenders across layout chrome and workout screens.
- History data is inconsistent in reactivity. [src/hooks/useWorkoutHistory.ts](src/hooks/useWorkoutHistory.ts) is live via `onSnapshot`, while [src/hooks/useExerciseHistory.ts](src/hooks/useExerciseHistory.ts) is a one-shot fetch. The result is stale exercise-specific analytics after edit operations in [src/components/ui/EditWorkoutModal.tsx](src/components/ui/EditWorkoutModal.tsx).
- The progress screen is paying for data it does not fully use. [src/pages/ProgressPage.tsx](src/pages/ProgressPage.tsx) subscribes to up to 1000 workouts, derives aggregate stats locally, and still issues separate per-exercise history fetches. It also exposes an “all history” selector state without rendering a true all-history detail view.
- Tooling drift is already visible. The workspace currently reports a TypeScript configuration error for `vite-plugin-pwa/client` in [tsconfig.json](tsconfig.json), and several Markdown files fail markdownlint.
- Documentation drift is substantial. The docs are no longer describing one coherent system; several files still describe earlier hosting assumptions, earlier feature scope, or already-fixed debt.

### Spec Drift Report

| File | Accuracy | Key Drift | Action Required |
|---|---|---|---|
| [README.md](README.md) | Obsolete | Still describes an AI Studio / Gemini app, not FitTrace. Local run instructions and environment expectations are wrong. | Delete and rewrite from scratch |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Partially accurate | Stack and `HashRouter` are correct, but base-path guidance is outdated, data model is incomplete, and current global/user settings plus manual/live session flow are missing. | Update |
| [PRD.md](PRD.md) | Partially accurate | Major features are recognizable, but several details no longer match code: one-set session prefill vs “3 empty sets”, cardio semantics, current edit/delete flows, public/private app mode, and stale phase tracking. | Update |
| [FIREBASE_GUIDE.md](FIREBASE_GUIDE.md) | Operational but stale | Hardcoded personal account/project instructions, missing current settings collections, and not aligned with the actual rules and app boot flow. | Update |
| [security_spec.md](security_spec.md) | Stale and partly aspirational | Invariants do not fully match [firestore.rules](firestore.rules), and the referenced `firestore.rules.test.ts` does not exist. | Update or split; remove fake test section unless real tests are added |
| [DATE_LOGIC_ANALYSIS.md](DATE_LOGIC_ANALYSIS.md) | Mostly accurate but too narrow | Describes a specific fixed incident that is now implemented in code. Useful history, but poor as a standalone permanent spec. | Consolidate into architecture or ADR, then delete |
| [TECHNICAL_DEBT.md](TECHNICAL_DEBT.md) | Stale | Marks work as `[DONE]` that is visibly not complete, and claims the app lacks a bottom nav although [src/components/layout/BottomNav.tsx](src/components/layout/BottomNav.tsx) exists. | Rewrite |
| [AGENTS.md](AGENTS.md) | Accurate as governance | Still matches the intended coding constraints and explains current repo expectations. | Retain as-is |

---

## SECTION 2: Atomic Execution Plan for the Implementation Model

### Step 1: Reproduce and Freeze the Current Validation Baseline
**Target File(s):** [package.json](package.json), [tsconfig.json](tsconfig.json), [src/vite-env.d.ts](src/vite-env.d.ts), [vite.config.ts](vite.config.ts)

**Objective:** Establish a clean baseline before refactoring so later changes can be verified against a known set of failures. This step is about confirming current typecheck and markdownlint behavior, not fixing architecture yet.

**The Gap:** The repository already has at least one real toolchain issue in `tsconfig.json`, plus multiple Markdown lint violations. If the execution model starts refactoring without recording the baseline, it will be impossible to tell whether a later failure is pre-existing or introduced.

**The Solution (Specification):**  
Run the current validation commands first. Record the exact output for `npm install` if dependencies are missing, `npm run lint`, and any configured Markdown lint command if present. Do not change application code in this step except for minimal type-reference cleanup if the PWA type issue blocks every later validation run.

**Code/Text Blueprint:**
```text
1. Install dependencies if needed.
2. Run: npm run lint
3. If markdownlint is configured, run it across all *.md files.
4. Save the failure list as the refactor baseline.
5. Only if the TypeScript config blocks all work, normalize the PWA type reference path.
```

**Verification Criteria:**  
The execution model can produce a short baseline report listing current TypeScript errors and current Markdown lint errors. Later steps must reduce or preserve this list intentionally, not accidentally expand it.

---

### Step 2: Make Exercise Reads Compatible with the Current Firestore Rules
**Target File(s):** [src/services/exerciseService.ts](src/services/exerciseService.ts), [src/hooks/useExercises.ts](src/hooks/useExercises.ts), [firestore.rules](firestore.rules), [src/types/index.ts](src/types/index.ts)

**Objective:** Replace the current “query everything, filter later” exercise loading flow with rule-safe query boundaries so exercise reads continue to work when multiple users own custom exercises.

**The Gap:** [src/services/exerciseService.ts](src/services/exerciseService.ts) currently runs an unrestricted query on `exercises` and applies ownership filtering in memory. That contradicts [firestore.rules](firestore.rules), which only permits a signed-in user to read global exercises and that same user’s custom exercises. This is a latent production failure, not just a style issue.

**The Solution (Specification):**  
Normalize the exercise model so all global exercises explicitly carry `isCustom: false`, and all user-created exercises carry `isCustom: true` plus `userId`. Replace the single broad query with two explicit queries:
- one query for global exercises
- one query for the authenticated user’s custom exercises

Merge the result client-side after both queries return. Update create/update paths so admin-created records always set the global invariant and user-created records always set the custom invariant. If the current rules need tightening to match the new invariant, update them in the same step.

**Code/Text Blueprint:**
```ts
type VisibleExercisesOptions = {
  userId: string;
  includeGlobal: boolean;
  includeCustom: boolean;
};

async function getVisibleExercises({ userId, includeGlobal, includeCustom }: VisibleExercisesOptions) {
  const requests = [];

  if (includeGlobal) {
    requests.push(
      getDocs(query(
        collection(db, 'exercises'),
        where('isCustom', '==', false),
        orderBy('name', 'asc')
      ))
    );
  }

  if (includeCustom) {
    requests.push(
      getDocs(query(
        collection(db, 'exercises'),
        where('userId', '==', userId),
        orderBy('name', 'asc')
      ))
    );
  }

  const snapshots = await Promise.all(requests);
  return mergeExerciseSnapshots(snapshots);
}
```

**Verification Criteria:**  
A non-admin user can load exercises without permission errors after another user creates custom exercises. Admin flows still load global exercises. Custom exercise creation still appears immediately in user-facing selectors.

---

### Step 3: Introduce a Single Owner for App-Wide Remote State
**Target File(s):** [src/App.tsx](src/App.tsx), [src/hooks/useAdmin.ts](src/hooks/useAdmin.ts), [src/hooks/useAppSettings.ts](src/hooks/useAppSettings.ts), [src/hooks/useUserSettings.ts](src/hooks/useUserSettings.ts), [src/hooks/useExercises.ts](src/hooks/useExercises.ts), [src/components/layout/Navbar.tsx](src/components/layout/Navbar.tsx), [src/components/layout/BottomNav.tsx](src/components/layout/UserMenu.tsx)

**Objective:** Stop duplicating identical listeners and lookups across the app shell by centralizing admin status, settings, and visible exercise catalog ownership.

**The Gap:** [src/App.tsx](src/App.tsx), [src/components/layout/Navbar.tsx](src/components/layout/Navbar.tsx), and [src/components/layout/BottomNav.tsx](src/components/layout/BottomNav.tsx) each independently call `useAdmin()`. User settings are also loaded in multiple places, including [src/App.tsx](src/App.tsx) and [src/features/workout/hooks/useWorkoutRestTimer.ts](src/features/workout/hooks/useWorkoutRestTimer.ts). This creates avoidable network work, inconsistent loading gates, and unnecessary rerenders.

**The Solution (Specification):**  
Create one application-level provider that owns:
- authenticated user
- admin status
- app settings
- user settings
- visible exercises

Convert the existing hooks into either:
- provider-internal loaders plus exported selectors, or
- thin wrappers over provider state

Leave mutation functions available, but stop letting leaf components create their own duplicate subscriptions for shared remote state.

**Code/Text Blueprint:**
```tsx
<AuthProvider>
  <AppDataProvider>
    <Router>
      <WorkoutSessionProvider>
        <AppContent />
      </WorkoutSessionProvider>
    </Router>
  </AppDataProvider>
</AuthProvider>
```

```ts
type AppDataState = {
  user: User | null;
  isAdmin: boolean;
  appSettings: AppSettings | null;
  userSettings: UserSettings;
  visibleExercises: Exercise[];
  loading: {
    auth: boolean;
    admin: boolean;
    appSettings: boolean;
    userSettings: boolean;
    exercises: boolean;
  };
};
```

**Verification Criteria:**  
There is only one admin status lookup and one user-settings subscription per session. Navbar, bottom nav, language controls, and admin gating still behave the same, but do not each trigger their own remote read path.

---

### Step 4: Split Workout Session State from Workout Session Actions
**Target File(s):** [src/hooks/useWorkoutSession.ts](src/hooks/useWorkoutSession.ts), [src/features/workout/context/WorkoutSessionContext.tsx](src/features/workout/context/WorkoutSessionContext.tsx), [src/pages/Dashboard.tsx](src/pages/Dashboard.tsx), [src/components/layout/Navbar.tsx](src/components/layout/BottomNav.tsx), [src/features/workout/components/WorkoutSetup.tsx](src/features/workout/components/ActiveSession.tsx), [src/features/workout/components/ExerciseSelector.tsx](src/features/workout/components/SetLogger.tsx)

**Objective:** Reduce broad app rerenders and make the workout session model easier to reason about by separating read-heavy state from mutation functions.

**The Gap:** [src/hooks/useWorkoutSession.ts](src/hooks/useWorkoutSession.ts) returns a large mutable object containing session state, derived flags, mutation methods, and timer control. Every consumer receives the full object through one context. This means editing notes, expanding one exercise, or ticking one set can rerender layout-level consumers that only care about `hasActiveSession`.

**The Solution (Specification):**  
Refactor the workout session provider into at least two contexts:
- state context
- actions context

If needed, add a small derived-status context for `hasActiveSession`, `isActiveLive`, and `isActiveManual`. Keep persistence logic in a reducer or in isolated internal hooks. Make the provider value(s) stable with `useMemo`.

**Code/Text Blueprint:**
```tsx
const WorkoutSessionStateContext = createContext<WorkoutSessionState | null>(null);
const WorkoutSessionActionsContext = createContext<WorkoutSessionActions | null>(null);

function WorkoutSessionProvider({ children }: Props) {
  const [state, dispatch] = useReducer(workoutSessionReducer, initialState, hydrateFromLocalStorage);

  const actions = useMemo(() => createWorkoutSessionActions(dispatch), [dispatch]);
  const derived = useMemo(() => deriveWorkoutSessionFlags(state), [state]);

  return (
    <WorkoutSessionStateContext.Provider value={{ ...state, ...derived }}>
      <WorkoutSessionActionsContext.Provider value={actions}>
        {children}
      </WorkoutSessionActionsContext.Provider>
    </WorkoutSessionStateContext.Provider>
  );
}
```

**Verification Criteria:**  
Typing in workout notes or toggling one set no longer forces unrelated chrome to rerender. The active-session banner on the dashboard still updates correctly. Session resume from localStorage still works after reload.

---

### Step 5: Make Workout History Derivations Reactive and Shared
**Target File(s):** [src/hooks/useWorkoutHistory.ts](src/hooks/useWorkoutHistory.ts), [src/hooks/useExerciseHistory.ts](src/hooks/useExerciseHistory.ts), [src/pages/ProgressPage.tsx](src/pages/HistoryPage.tsx), [src/features/workout/components/ExerciseLogger.tsx](src/features/workout/components/ExerciseHistoryView.tsx), [src/components/ui/EditWorkoutModal.tsx](src/components/ui/WorkoutDetailsModal.tsx)

**Objective:** Eliminate stale progress data and remove repeated per-exercise history fetches by deriving exercise-level views from one owned workout history source.

**The Gap:** [src/pages/ProgressPage.tsx](src/pages/ProgressPage.tsx) already subscribes to broad workout history, but [src/hooks/useExerciseHistory.ts](src/hooks/useExerciseHistory.ts) fetches exercise history separately. [src/features/workout/components/ExerciseLogger.tsx](src/features/workout/components/ExerciseLogger.tsx) also calls `useExerciseHistory()` for each opened exercise. Editing a workout via [src/components/ui/EditWorkoutModal.tsx](src/components/ui/EditWorkoutModal.tsx) does not guarantee the progress chart and session list refresh.

**The Solution (Specification):**  
Deprecate `useExerciseHistory()` as an independent fetch hook. Replace it with a derived selector built on top of the live workout history source. In [src/pages/ProgressPage.tsx](src/pages/ProgressPage.tsx), either:
- render true all-history content when no exercise is selected, or
- remove the “all history” control from the exercise selector

Do not keep a control that has no matching content state.

**Code/Text Blueprint:**
```ts
function useDerivedExerciseHistory(exerciseId: string | null) {
  const { workouts } = useWorkoutHistoryStore();

  return useMemo(() => {
    if (!exerciseId) return [];
    return workouts.filter(workout =>
      workout.exercises.some(ex => ex.exerciseId === exerciseId)
    );
  }, [workouts, exerciseId]);
}
```

**Verification Criteria:**  
After editing or deleting a workout, the progress chart and the session list update without a page reload or manual reselection. Expanding multiple active exercises no longer creates separate network reads for each history panel.

---

### Step 6: Normalize Workout Edit Semantics with the Rest of the App
**Target File(s):** [src/components/ui/EditWorkoutModal.tsx](src/components/ui/EditWorkoutModal.tsx), [src/components/ui/WorkoutDetailsModal.tsx](src/components/ui/WorkoutDetailsModal.tsx), [src/types/index.ts](src/types/index.ts)

**Objective:** Bring workout-edit behavior into alignment with the rest of the data model so edited workouts are not shaped differently from created workouts.

**The Gap:** [src/components/ui/EditWorkoutModal.tsx](src/components/ui/EditWorkoutModal.tsx) creates and reindexes sets starting at `0`, while the live session flow in [src/hooks/useWorkoutSession.ts](src/hooks/useWorkoutSession.ts) uses `1`-based `setIndex` values. The modal also deep-clones exercises via `JSON.parse(JSON.stringify(...))`, which is brittle and unnecessary.

**The Solution (Specification):**  
Normalize all edited set indices to be `1`-based. Replace the JSON deep clone with `structuredClone` or a purpose-built mapper. Centralize set normalization so both live-session creation and modal editing use the same invariant.

**Code/Text Blueprint:**
```ts
function normalizeSets(sets: ExerciseSet[]): ExerciseSet[] {
  return sets.map((set, index) => ({
    ...set,
    setIndex: index + 1,
  }));
}

const initialEditedExercises = structuredClone(workout.exercises).map(ex => ({
  ...ex,
  sets: normalizeSets(ex.sets),
}));
```

**Verification Criteria:**  
Open an edited workout, save it, reopen it, and confirm that set numbering remains consistent with live-created workouts. The workout details modal and progress list must display the same set ordering after save.

---

### Step 7: Replace the README with a Real Product Entry Point
**Target File(s):** [README.md](README.md), [package.json](package.json), [server.ts](server.ts)

**Objective:** Rewrite the root README so a developer can understand, run, and deploy FitTrace without seeing unrelated AI Studio or Gemini instructions.

**The Gap:** [README.md](README.md) currently describes a different product. It references AI Studio, Gemini API setup, and a run model that does not match the repo.

**The Solution (Specification):**  
Delete the current README content and replace it with:
- project overview
- actual tech stack
- local development steps
- Firebase prerequisites
- build and preview steps
- note about the Express-based dev server in [server.ts](server.ts)
- note about PWA setup and route hosting assumptions

Do not retain any Gemini or AI Studio text.

**Code/Text Blueprint:**
```md
# FitTrace

## Overview
Short product description.

## Stack
React, TypeScript, Vite, Firebase, Tailwind, Recharts, PWA plugin.

## Local Development
1. npm install
2. configure firebase-applet-config.json
3. npm run dev

## Build
npm run build

## Firebase Requirements
Auth, Firestore, Storage, rules deployment.

## Architecture Pointers
Link to ARCHITECTURE.md and PRD.md.
```

**Verification Criteria:**  
A new developer reading only [README.md](README.md) can start the app and understand the dependency on Firebase without any mention of AI Studio or `GEMINI_API_KEY`.

---

### Step 8: Rewrite the Architecture and PRD Documents to Match Current Behavior
**Target File(s):** [ARCHITECTURE.md](ARCHITECTURE.md), [PRD.md](PRD.md), [src/App.tsx](src/App.tsx), [src/hooks/useWorkoutSession.ts](src/hooks/useWorkoutSession.ts), [src/services/exerciseService.ts](src/services/exerciseService.ts), [src/services/workoutService.ts](src/services/workoutService.ts), [src/types/index.ts](src/types/index.ts), [vite.config.ts](vite.config.ts)

**Objective:** Bring the two core specification documents back into sync with the actual application shell, data model, session modes, and current feature set.

**The Gap:** [ARCHITECTURE.md](ARCHITECTURE.md) omits major current behavior and makes outdated hosting claims. [PRD.md](PRD.md) still describes older feature details such as three default sets and older cardio semantics, and it does not clearly document current edit/delete flows or public/private app access behavior.

**The Solution (Specification):**  
Rewrite the architecture document sections so they explicitly cover:
- app shell composition
- provider hierarchy
- auth/admin/app settings/user settings ownership
- exercise catalog ownership
- manual vs live workout session modes
- current workout and exercise schema fields
- current Vite base-path behavior from [vite.config.ts](vite.config.ts)

Rewrite the PRD so it describes the current product truth, including:
- custom exercise ownership
- maintenance/public mode
- edit/delete capabilities
- current analytics coverage
- current known limitations

If product intent still requires “3 default sets,” raise that as a product discrepancy instead of silently documenting false behavior.

**Code/Text Blueprint:**
```md
## Architecture
- Provider hierarchy
- Route map
- State ownership map
- Firestore schema
- Offline strategy
- Build and hosting assumptions

## PRD
- Core flows
- Admin flows
- Custom exercise flows
- Session modes
- History and analytics
- Current shipped status
- Known gaps
```

**Verification Criteria:**  
Every behavior claimed in [ARCHITECTURE.md](ARCHITECTURE.md) and [PRD.md](PRD.md) can be traced directly to a current code path. There are no claims about AI Studio, relative `./` asset bases, or “3 default sets” unless code was updated to match.

---

### Step 9: Align Firebase and Security Documentation with the Real Rules
**Target File(s):** [FIREBASE_GUIDE.md](FIREBASE_GUIDE.md), [security_spec.md](security_spec.md), [firestore.rules](firestore.rules), [src/services/firebase.ts](src/services/firebase.ts)

**Objective:** Make the operational Firebase guide and the security spec describe the real access model, current collections, and actual test posture.

**The Gap:** [FIREBASE_GUIDE.md](FIREBASE_GUIDE.md) is tied to a specific personal Firebase account and project setup. [security_spec.md](security_spec.md) partially matches the rules, but it omits some real fields, includes outdated assumptions, and references a nonexistent test suite.

**The Solution (Specification):**  
Update [FIREBASE_GUIDE.md](FIREBASE_GUIDE.md) to:
- remove personal account instructions
- describe required collections and documents
- document `settings/global` and `users/{userId}/settings/display`
- explain the current Auth, Firestore, and Storage setup as repo-agnostic instructions

Update [security_spec.md](security_spec.md) to:
- mirror the current rule invariants exactly
- document the read restrictions on exercises and workouts
- explain the admin fallback behavior if it remains intentional
- remove the fake test-runner section unless a real rules test file is added in the same step

**Code/Text Blueprint:**
```md
## Firestore Collections
- admins
- settings/global
- exercises
- workouts
- users/{uid}/settings/display

## Security Invariants
- who can read global exercises
- who can read custom exercises
- who can mutate settings
- who can read and mutate workouts

## Test Status
- Either: "Rules tests implemented in ..."
- Or: "No executable rules tests exist yet"
```

**Verification Criteria:**  
The doc text for each collection and access rule can be matched line-for-line against [firestore.rules](firestore.rules). The repo contains no documentation that implies a rules test file exists when it does not.

---

### Step 10: Consolidate Incident Notes and Rewrite the Technical Debt Ledger
**Target File(s):** [DATE_LOGIC_ANALYSIS.md](DATE_LOGIC_ANALYSIS.md), [TECHNICAL_DEBT.md](TECHNICAL_DEBT.md), [ARCHITECTURE.md](ARCHITECTURE.md), [AGENTS.md](AGENTS.md)

**Objective:** Convert narrow historical notes into durable architecture knowledge, and replace the stale debt list with one that reflects actual open work.

**The Gap:** [DATE_LOGIC_ANALYSIS.md](DATE_LOGIC_ANALYSIS.md) documents a specific bug that appears fixed in current code. [TECHNICAL_DEBT.md](TECHNICAL_DEBT.md) contains false completion markers and claims that contradict the current repo, including the presence of a bottom nav.

**The Solution (Specification):**  
Fold the lasting lessons from [DATE_LOGIC_ANALYSIS.md](DATE_LOGIC_ANALYSIS.md) into the architecture document’s workout-session section or into a short ADR subsection, then delete the standalone incident note. Rewrite [TECHNICAL_DEBT.md](TECHNICAL_DEBT.md) from scratch using present-tense, verifiable debt only:
- rule-safe exercise querying
- duplicated app-wide subscriptions
- broad workout session context
- stale progress data flow
- tooling drift
- documentation governance

Retain [AGENTS.md](AGENTS.md) unchanged unless the refactor introduces a new hard convention that truly belongs there.

**Code/Text Blueprint:**
```md
# Technical Debt

## Open
- Exercise queries are not rule-safe
- App-wide data is duplicated across hooks
- Workout session context is too broad
- Progress derivations are split across live and one-shot hooks
- Docs are drifting without a single source of truth

## Closed
Only items that are demonstrably fixed and validated
```

**Verification Criteria:**  
After this step, there is no standalone doc pretending a fixed incident is still an active spec, and [TECHNICAL_DEBT.md](TECHNICAL_DEBT.md) contains only currently true, demonstrable debt items.

---

### Step 11: Run a Final Validation Sweep Across Code and Docs
**Target File(s):** [package.json](package.json), [README.md](README.md), [ARCHITECTURE.md](ARCHITECTURE.md), [PRD.md](PRD.md), [FIREBASE_GUIDE.md](FIREBASE_GUIDE.md), [security_spec.md](security_spec.md), [TECHNICAL_DEBT.md](TECHNICAL_DEBT.md)

**Objective:** Confirm that the refactor did not regress application behavior and that the documentation set is internally consistent.

**The Gap:** Without a final sweep, the refactor can leave the repo in a mixed state where code is improved but documentation still contradicts it, or docs are rewritten but basic type validation fails.

**The Solution (Specification):**  
Run:
- TypeScript validation
- build validation if possible
- Markdown lint validation on all retained `.md` files

Then perform a manual consistency pass:
- README matches run flow
- architecture matches provider structure
- PRD matches shipped behavior
- Firebase/security docs match rules
- technical debt contains only active items

**Code/Text Blueprint:**
```text
1. npm run lint
2. npm run build
3. markdownlint "**/*.md"
4. Manually compare updated docs against current code paths
5. Record any remaining intentional gaps in TECHNICAL_DEBT.md
```

**Verification Criteria:**  
Type validation passes, the build completes, and the retained Markdown files no longer fail basic markdownlint rules. The documentation set reads as one coherent system rather than a stack of historical snapshots.
