# Technical Architecture: Fitness Tracker PWA

## 1. Tech Stack
- **Frontend:** React + Vite
- **Styling:** Tailwind CSS
- **Database / Auth / Storage:** Firebase (Firestore, Firebase Auth, Firebase Storage)
- **Charts:** Recharts
- **PWA Capabilities:** `vite-plugin-pwa`
- **Language:** TypeScript (Strict).

## 2. Coding Standards & Constraints
- **Separation of Concerns:** UI components must NOT contain raw Firebase calls. Use custom hooks (e.g., `useExercises()`, `useWorkout()`) for data fetching and business logic.
- **File Size Constraint:** No file should exceed 200 lines. If a component grows, break it down into smaller sub-components (e.g., extract a `SetInputRow` from `ExerciseCard`).
- **Early Returns:** Avoid deep nesting and nested ternary operators.
- **State Management:** Keep it local with `useState` / `useReducer`, and use React Context only for global states like `AuthContext` or `WorkoutSessionContext`.

## 3. Directory Structure
```text
/src
  /assets        # Static assets, PWA icons
  /components    # Generic UI components (Layout, Shared UI)
  /features      # Domain-specific modules
    /admin       # Exercise management
    /workout     # Session flow, logging
  /hooks         # Shared hooks
  /services      # Firebase config and API wrappers (firebase.ts)
  /pages         # Route components
  /utils         # Global helpers
  /types         # Shared interfaces
```

## 4. Auth & Navigation Decisions
- **Auth Provider**: A high-level `AuthProvider` wraps the application to manage Firebase Auth state.
- **Route Protection**: The `App` component handles conditional rendering based on authentication state.
- **Admin Verification**: The `useAdmin` hook performs a Firestore lookup to verify admin status against the `admins` collection.
- **Layout**: A persistent `Navbar` is displayed for authenticated users.

## 5. Firestore Database Schema

### Collection: `admins`
Used to authorize admin users.
- Document ID: `userId` (from Firebase Auth)
- Fields: `email` (string), `createdAt` (timestamp)

### Collection: `exercises` (Global)
- `id`: string (auto-generated)
- `name`: string
- `category`: string (e.g., "Chest", "Legs")
- `loadType`: enum string (`"WEIGHT_REPS"`, `"LEVEL_REPS"`, `"CARDIO"`)
- `thumbnailUrl`: string (URL from Firebase Storage)
- `defaultNotes`: string (optional)
- `createdAt`: timestamp

### Collection: `workouts` (Per User)
- `id`: string (auto-generated)
- `userId`: string (Firebase Auth UID)
- `date`: timestamp
- `notes`: string (optional)
- `exercises`: Array of Objects. Structure:
  - `exerciseId`: string (reference to exercises collection)
  - `exerciseName`: string (denormalized for faster UI rendering)
  - `sets`: Array of Objects:
    - `setIndex`: number
    - `weight`: number (optional, for WEIGHT_REPS)
    - `level`: number (optional, for LEVEL_REPS/CARDIO)
    - `reps`: number (optional)
    - `duration`: number (optional, in seconds, for CARDIO)
  - `sessionNotes`: string (optional modification specific to this workout)

## 5. Security Rules Concept (firestore.rules)
- **`exercises`**: `read`: if true (or authenticated); `write`: if `request.auth.uid` exists in `admins` collection.
- **`workouts`**: `read`, `write`: if `request.auth.uid == resource.data.userId` (Users can only read/write their own workout data).
- **`admins`**: `read`: if `request.auth.uid == document.id`; `write`: false (managed manually via Firebase Console).

## 6. Offline Strategy
- Enable `enableIndexedDbPersistence` (or `initializeFirestore` with `localCache`) in `services/firebase.ts`.
- Use `vite-plugin-pwa` to cache `index.html`, JS bundles, and static assets via Service Worker.
