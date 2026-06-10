# Technical Architecture: FitTrace Fitness Tracker

This document details the software architecture, provider structure, state propagation flows, and data schemas governing the **FitTrace Fitness Tracker** application.

---

## 1. App Shell Composition & Layout

The application has a mobile-first, responsive single-page responsive design that automatically adapts viewport layouts using Tailwind CSS:
- **Mobile Layout:** Primary navigation is anchored to the bottom via the `BottomNav` element, which places actions under comfortable touch targets (44px+) of the thumbs. The navbar remains compact.
- **Desktop Layout:** Features a persistive vertical or horizontal `Navbar` at the top of the viewport. The mobile bottom navigation is hidden.
- **Active Session State:** When the user has an active, ongoing workout session, the layout adjusts dynamically: the bottom padding is removed (`pb-0` on active live session, or `pb-20 sm:pb-0` when inactive) to keep active workout headers, rest timers, and action footers pinned flush to the viewport borders.

---

## 2. Provider Hierarchy

The application utilizes a strictly ordered parent-to-child component nesting sequence to propagate authenticated sessions, user preference streams, historical data, and current operational states:

```text
<AuthProvider>                      [Global Auth State Monitor]
  └── <AppDataProvider>             [Global Static Catalogs, Settings, & Mutations Provider]
        └── <WorkoutHistoryProvider> [User Historical Workout Stream & Queries Controller]
              └── <Router>           [React Router navigation context (HashRouter)]
                    └── <WorkoutSessionProvider> [Active live/manual session logging context]
                          └── <AppContent /> [Component Layout with route controllers]
```

- **`AuthProvider`:** Controls user session, initialization, and exposes identity status.
- **`AppDataProvider`:** Subscribes to global system parameters (`appSettings`), displays individual user displays (`userSettings`), parses standard exercise catalogs sorted alphabetically, and acts as the gatekeeper for core database writes.
- **`WorkoutHistoryProvider`:** Aggregates and maintains a cached state of user completed workout sessions to populate stats and logs securely.
- **`HashRouter`:** Powers client-side routing. Hash navigation (`#/path`) is employed to bypass direct web-server requirements, allowing routes to function correctly under custom assets directories or subpaths without causing router 404 errors.
- **`WorkoutSessionProvider`:** Encapsulates the active workout state (current logs, set telemetry, active duration timers, and passive rest alerts).

---

## 3. Route Map

Access to routes is governed by the state of user registration, authentication verification, and administrative rights:

| Path | Component | Route Guard / Access Constraints |
| :--- | :--- | :--- |
| `/login` | `LoginPage` | Unauthenticated fallback route. Authenticated users are auto-redirected to `/`. |
| `/` | `Dashboard` | Authenticated users only. Lists recent workouts and session starting gates. |
| `/new-workout` | `NewWorkout` | Authenticated users only. Enforces the active workout session UI (handles categories, loggers). |
| `/history` | `HistoryPage` | Authenticated users only. High-fidelity workout log, edit modes, and delete triggers. |
| `/progress` | `ProgressPage` | Authenticated users only. Exercise selector and progressive Recharts line charts. |
| `/my-exercises` | `MyExercisesPage` | Authenticated users only. Enables standard custom exercises creation, updating, or deletion. |
| `/admin` | `AdminPage` | Authorized Administrators only. Enforces local checking via `ProtectedAdminRoute`. |

### route guards
- **`ProtectedAdminRoute`**: Determines if the user's UID exists in the `admins` collection on Firestore. If not found, routes are safely bounced back to `/`.
- **Maintenance Bypass (Private Mode)**: If global `appSettings.isPublic` is configured to `false`, non-admin users are locked out by a dedicated app-wide blocking screen and must log out. Admins bypass the lock to facilitate updates.

---

## 4. State Ownership Map

State is classified into client-persistent (local), shared transient, and cloud-synchronized (durable) domains to minimize memory bloat:

```text
┌───────────────────────┐       ┌───────────────────────┐       ┌───────────────────────┐
│     Client Local      │       │   Transient Context   │       │    Cloud Persistent   │
├───────────────────────┤       ├───────────────────────┤       ├───────────────────────┤
│ - Expanded Card IDs   │       │ - activeExercises     │       │ - Global exercises    │
│ - Rest Timer Values   │ ────> │ - workoutNotes        │ ────> │ - User custom list    │
│ - Category filters    │       │ - sessionMode state   │       │ - Completd workouts   │
│ - UI toggles          │       │ - Timer ticking states│       │ - admins list         │
└───────────────────────┘       └───────────────────────┘       └───────────────────────┘
```

- **Local UI State:** Individual card layouts, search keyword buffers, selection filters, and modals are isolated strictly inside functional hooks or component structures to prevent parent redraws.
- **Active Session State:** Active workouts (`activeExercises`, `workoutNotes`, `sessionMode`, `workoutStartedAt`) are managed in a single central store (`WorkoutSessionContext`) and persist across browser refreshes via custom synchronization layers mapped into client `localStorage` keys.
- **Durable Database State:** Cached and fetched dynamically inside services. Mutations propagate from clients to Firestore and are read back through reactive snapshot subscriptions mapped inside providers.

---

## 5. Firestore Database Schema

The database relies on three major collections utilizing explicit data types and server timestamps:

### 5.1. Collection: `admins`
Used to authorize admin roles for modifications to general system assets.
* *Document ID:* `userId` (Firebase Authentication UID)
* *Schema:*
  ```typescript
  interface Admin {
    email: string;
    createdAt: Date;
  }
  ```

### 5.2. Collection: `settings`
Used to track global variables for access modes. Includes a singular root document with ID `global`.
* *Document ID:* `global`
* *Schema:*
  ```typescript
  interface AppSettings {
    isPublic: boolean;
    updatedAt: Date;
    updatedBy: string; // UserId of the modifier
  }
  ```

### 5.3. Collection: `users`
Underneath each user, preferences are partitioned to ensure logical data isolation.
* *Settings Path:* `users/{userId}/settings/display`
* *Schema:*
  ```typescript
  interface UserSettings {
    fontSize: 'normal' | 'large' | 'xlarge';
    language: 'bg' | 'en';
    notificationSound: string; // bell files mapped under /public/sounds/
    isNotificationsEnabled: boolean;
    updatedAt: Date;
  }
  ```

### 5.4. Collection: `exercises`
Stores both global standard catalogues and custom user exercises.
* *Document ID:* Auto-generated UUID from Firestore
* *Fields:*
  ```typescript
  interface Exercise {
    id?: string;
    name: string;
    category: string;
    loadType: 'WEIGHT_REPS' | 'LEVEL_REPS' | 'CARDIO';
    thumbnailUrl?: string; // Image path from Firebase Storage
    defaultNotes?: string;
    description?: string;
    url?: string; // Instruction links if available
    userId?: string | null; // Scopes custom exercises; null for global
    isCustom: boolean;
    createdAt: Date;
    affectedPart?: string; // Target muscle/focus details
  }
  ```

### 5.5. Collection: `workouts`
Houses completed session logs populated with detailed metrics and notes.
* *Document ID:* Auto-generated UUID from Firestore
* *Fields:*
  ```typescript
  interface Workout {
    id?: string;
    userId: string;
    date: Date;
    updatedAt?: Date;
    notes?: string;
    startedAt?: Date; // Start of live recording
    durationSeconds?: number; // Total length of session in seconds
    exercises: WorkoutExercise[];
  }

  interface WorkoutExercise {
    id: string; // Unique transient instance string
    exerciseId: string;
    exerciseName: string;
    sessionNotes?: string;
    sets: ExerciseSet[];
    startedAt?: Date;
    durationSeconds?: number;
    affectedPart?: string;
  }

  interface ExerciseSet {
    setIndex: number;
    weight?: number; // kilogram values for WEIGHT_REPS
    level?: number;  // setting speed/level for LEVEL_REPS or CARDIO
    reps?: number;   // repetition count
    duration?: number; // duration in seconds (for cardio)
    isCompleted?: boolean;
  }
  ```

### 5.6. Collection: `workout_templates`
Used to manage planned workout templates (routines) that can be started live or manually.
* *Document ID:* Auto-generated UUID from Firestore
* *Fields:*
  ```typescript
  interface WorkoutTemplate {
    id?: string;
    userId: string;
    name: string;
    exerciseIds: string[];
    createdAt: Date;
  }
  ```

---

## 6. Offline Strategy

The progressive implementation is fully resilient to gym networks with poor connectivity:
1. **Firestore Client Cache:** Configured explicitly within `src/services/firebase.ts` utilizing `persistentLocalCache` and `persistentMultipleTabManager`. This guarantees that queries against history, custom lists, and updates function instantenously in offline environments. Mutations are queued and synced automatically on reconnection.
2. **Assets Cache:** The Service Worker is initialized via `vite-plugin-pwa` in `vite.config.ts`, specifying `registerType: 'autoUpdate'`. It bundles and caches static HTML, Javascript scripts, stylesheet outputs, vector SVGs, and Google fonts via Workbox directives.
3. **Timer Assets:** Audio assets used by rest-timers (`Happy bells.wav`, `Opening Bell.mp3`, `Uplifting bells.wav`) are placed under `/public/sounds/` and compiled during builds to guarantee offline availability.

---

## 7. Build and Hosting Assumptions

The application is bundled under standard ESM and client production settings:
- **Build Script:** `npm run build` bundles static files into `dist/`.
- **Base Asset Paths:** Configured in `vite.config.ts` using a conditional environment ternary logic:
  - **In Development Mode:** Bundles default to `/` base.
  - **In Production Mode:** Bundles compile under base `/FitTrace/` paths to support serving under directory subpaths (such as GitHub Pages or similar reverse-proxied hosting setups) while maintaining correct relative paths for local resource fetching.
- **Server Dev Port:** Runs on default container and proxy configurations. File-watching HMR configuration contains instructions to read process environmental variables (`DISABLE_HMR === 'true'`) to disable live HMR sockets on sandbox platforms, avoiding build cycle collision during remote workspace filesystem edit streams.

---

## 8. Architectural Decision Records (ADRs)

### ADR 1: Workout Session Date Generation & Conflict Resolution

#### Context & Incident Lessons
Previously, workout session dates were managed via the `useWorkoutSession` hook and serialized directly to `localStorage` as ISO strings. The system suffered from an incident where stale dates persisted inside `localStorage` (e.g., from an incomplete or un-cleared session initiated several days prior) and were erroneously attached to newly completed workouts. Under standard LIVE session recording, the date input panel was hidden, meaning users compiled and saved workouts with back-dated timestamps without visual warning.

To resolve date drift and data corruption, a strict date-generation lifecycle and conflict resolution protocol were established.

#### Design & Implementation Decisions

1. **Automatic Initialization & Date Locking:**
   - **LIVE Mode Auto-Date:** When a user initiates a LIVE session, if it is the first exercise added to the log, `workoutDate` is automatically and dynamically updated to `new Date()`.
   - **Mode-switching Reset:** When toggling the session logging mode to `LIVE` within the `WorkoutSetup` interface, any pre-loaded date in the local hook is immediately reset to the current system date.
   - **Immutability of LIVE Timestamps:** In the Setup UI, manual date selector picking is strictly disabled while configured to `LIVE` mode, certifying that all real-time recording is linked exclusively to the absolute point of activity.

2. **Cross-Session Conflict Resolution:**
   To guarantee store and database consistency across pages, the global `WorkoutSessionProvider` serves as the single source of truth. The application mitigates user collision through dynamic prompt overlays:
   - **Ongoing LIVE vs. Back-Dated Log:** When an active real-time recording session exists in the background, a user trying to create a historical/past workout is blocked. They are presented with an `ActionPromptModal` indicating they must either finalize or discard the active LIVE run first.
   - **MANUAL Draft vs. LIVE Startup:** If an incomplete manual back-dated draft is occupying `localStorage`, trying to start a LIVE session presents a chooser: resume the current draft or discard it entirely to launch a clean real-time log.

#### Core Path of Date Flow
```text
[Dashboard Check] ──> [ActionPromptModal (Conflict Resolved)] ──> [useWorkoutSession (workoutDate set to now)] ──> [finishWorkout] ──> [workoutService.saveWorkout] ──> [Firestore Timestamp document]
```
