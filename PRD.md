# Product Requirements Document (PRD): FitTrace Fitness Tracker

---

## 1. Overview
Gym enthusiasts require a fast, frictionless, mobile-optimized tool to record workout sessions, track training progression, and manage exercise catalogs. **FitTrace** is a Progressive Web App (PWA) tailored for responsive touch interaction, featuring smart set logging, automatic rest timer notifications, administrative control toggles, and rich visual analytics.

---

## 2. Core Flows

### 2.1. On-The-Fly Workout Logger
1. **Start Live Workout:** Tapping "New Workout" initiates a real-time training session.
2. **Category Selection:** Users select from primary muscle group directories (e.g., Chest, Back, Legs, Arms).
3. **Adding Exercises:** Adding an exercise opens an optimized Set Logger. To minimize manual entry fatigue, the app dynamically consults the user's past training logs:
   - If historical recordings are available, the logger retrieves properties from the **last completed set** (cloning reps, weights, levels, or durations).
   - If no historical data is found, standard baseline defaults (10 reps, 0 weight) are pre-populated.
   - **Discrepancy (Smart Sets Initial State):** While original theoretical requirements suggested pre-populating three blank sets, real-world touch interaction tests revealed this caused screen clutter on small mobile devices. The production app maintains exactly **1 smart default set**. Users append supplementary sets instantly via the "+ Add Set" button.
4. **Logging Set Telemetry:** Users enter parameters mapped directly to the exercise's dynamic `LoadType`.
5. **Set Completion:** Completing a set registers the metrics, marks the set checked, and initiates a passive notification timer.
6. **Finishing Session:** Saves active exercises with completed sets, logs notes, calculates session duration, and cleans the temporary logging caches.

### 2.2. Rest Notification Timer
- Completing a set under `LIVE` mode fires a visual rest timer on the page margin.
- Resting intervals default to 90 seconds (customizable upon trigger).
- Once the timer expires, the app triggers sound files loaded offline (`Happy bells`, `Opening Bell`, or `Uplifting bells`) corresponding to preferences configured inside **User Settings**.
- Rest timers do not engage automatically inside retroactive `MANUAL` back-logging sessions to avoid notification clutter during rapid historical entries.

### 2.3. Exercise History & Re-logging
- When examining an active card, the logger displays the historical lifting logs of the last session.
- Users can toggle a tab to view full historical lists for that specific exercise directly within the workout interface, keeping past accomplishments instantly accessible before loading heavy plates.

### 2.4. Workout Templates / Routines
To facilitate streamlined session planning, users can manage reusable workout skeletons called templates/routines:
1. **Scope:** Planning includes pre-selecting categories and exercise types. Weights, reps, and set counts are omitted during templated planning, as these are automatically populated during session activation based on historical logs or standard defaults.
2. **Creation from History:** Users can choose any past completed workout from their History log and save it as a routine. This automatically imports all exercises of that past session into the template, offering rapid naming and exercise filtering.
3. **Template Management:** Routines are visible in a dedicated "Workout Templates" section on the Dashboard. Users can click any template to preview its exercises, start a LIVE session with those exercises loaded, record a MANUAL backlog, edit the template name/exercises, or delete the template.

---

## 3. Session Modes

FitTrace supports two distinct workout recording philosophies, selectable when spawning or recording a new session:

### 3.1. LIVE Workout Mode
- **Recording Dynamics:** Tailored for active gym sessions. Tracks training duration dynamically.
- **Interactions:** Requires checking sets as "Completed" during workouts. Only completed sets are compiled into historical logs upon ending the workout; incomplete draft sets are skipped.
- **Rest Timers:** Automatically fires the countdown timer when standard sets are marked completed.
- **Date Locking:** Automatically binds the session date to the current real-world timestamp.

### 3.2. MANUAL Back-Log Mode
- **Recording Dynamics:** Designed for back-logging workouts completed earlier in the day or week.
- **Interactions:** Adding sets pre-checks them as "Completed" to prevent bulk-entry omission. All populated entries are written directly to database logs on finish.
- **Rest Timers:** Rest timers are deactivated.
- **Flexible Calendar:** Enables manual correction of the session date via a calendar picker, supporting retrospective data logging.

---

## 4. Custom Exercise Flows

Users can create and edit their own exercises on the fly without system lock-out:
- **On-The-Fly Generation:** Users can create custom exercises directly from the exercise category selection screen.
- **User Scoping:** Custom exercises receive a `userId` property and are flagged with `isCustom: true`. They are strictly isolated and visible only to the creator.
- **Modifications:** Standard users have full write access to edit names, categories, descriptions, or delete their custom exercises entirely.
- **Advanced DeDuplication Mapping (Migration):** Over time, administrators may introduce official global equivalents of common custom exercises. To prevent orphaned histories, users or administrators can trigger a **Migration Merge**:
  - The feature migrates past histories referencing the custom exercise ID to the designated official system exercise ID.
  - The custom exercise is then safely deleted to keep the catalog clean.

---

## 5. Admin & Maintenance Flows

### 5.1. Global Catalog Ownership
- Administrators can manage the official global exercises catalog (`isCustom: false`) available to every user on the platform.
- Global additions demand custom image assets (thumbnails) uploaded securely directly to **Firebase Storage** buckets, maintaining lightweight network indexing.

### 5.2. Private Maintenance Mode
The platform features a global administrative system gate managed in Firestore setting collections:
- **State Toggles:** Admins can flag `settings/global.isPublic` to `false` via Settings interfaces.
- **Standard User Lockdown:** When private mode is active, standard users attempting to access the platform are intercepted by a secure lock banner and prevented from seeing analytics, history, or workout loggers.
- **Admin Pass-Through:** Administrator user UIDs completely bypass the lockdown layer, allowing testing of deployments or content uploads securely before opening public register gates.

---

## 6. History and Analytics

### 6.1. High-Fidelity History Logs
- The **History** view lists all compiled training sessions.
- Users can expand sessions to review specific exercises, sets, weights, and logs.
- **Retroactive Correction:** Completed workouts are completely editable. Users can open previous sessions in editing modals, update weight metrics, reps, add or delete sets, or remove individual workouts from their profile entirely.

### 6.2. Progression Analytics
- The **Progress** view enables drilling down into specific exercises.
- Enforces an intuitive interactive selection widget containing Categories and individual Exercises.
- Displays a responsive, sleek **Recharts line chart** mapping lifting volumes (`WEIGHT_REPS`), machine resistance levels (`LEVEL_REPS`), or durations (`CARDIO`) across past training sequences.
- Shows maximum metrics (Best Weight/Level), average repetitions, and overall set volume alongside the chart.

---

## 7. Current Shipped Status

The platform has completed all baseline launch features:
- [x] **User Authentication:** Single-tier Google Authentication check.
- [x] **Flexible Session Engine:** Real-world transition schemas between Live training and retroactive logging.
- [x] **State Cache Recovery:** Resilient localStorage backends keeping session sets safe from page crashes.
- [x] **Persistent Database Sync:** Reactive subscriptions parsing Firestore items directly.
- [x] **Offline Service Worker Cache:** Fully functional assets delivery and indexedDB database sync.
- [x] **Interactive Progression Visualization:** Recharts dashboards tracking metrics.
- [x] **Custom Exercise Migrations:** Exercise merging capability for deduplication.

---

## 8. Known Gaps & Limitations

1. **Storage Network Reliance:** While text data synchronizes seamlessly offline through Firestore client caches, uploading physical image thumbnails for exercises requires live, online network connections to resolve Firebase Storage bucket APIs. Offline creations fall back gracefully to placeholder SVGs.
2. **Concurrent Multi-Device Edits:** If updates to a particular workout document are conducted from separate offline devices simultaneously, sync resolution is governed by standard *last-write-wins* rules upon reconnection.
3. **Bulk Custom Exercise Ownership Transfer:** Merging custom exercises to global exercises must be triggered on an individual exercise basis; bulk migrations of user registries are currently unsupported.
