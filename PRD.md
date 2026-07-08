# Product Requirements Document (PRD): FitTrace Fitness Tracker

---

## 1. Overview
Gym enthusiasts require a fast, frictionless, mobile-optimized tool to record workout sessions, track training progression, and manage exercise catalogs. **FitTrace** is a Progressive Web App (PWA) tailored for responsive touch interaction, featuring smart set logging, automatic rest timer notifications, administrative control toggles, and rich visual analytics.

---

## 2. Target Users and Roles

### 2.1. Standard Users
- **Authentication:** Users authenticate securely via Google Auth.
- **Capabilities:** Create, edit, and log workouts (Live and Manual). Create custom exercises, save workout templates, view personal history, and customize personal settings.

### 2.2. Administrators
- **Authentication:** Authenticated via Google Auth and flagged with an admin role/access level.
- **Capabilities:** Manage global system exercises (add, edit, delete, upload image thumbnails to Firebase Storage). Can view the Admin dashboard and test the platform even when it is in private/maintenance mode.

---

## 3. Session Modes

FitTrace supports two distinct workout recording philosophies:

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

## 4. Core Features & Flows

### 4.1. On-The-Fly Workout Logger & Smart Prefill
- **Start Workout:** Tapping "New Workout" initiates a real-time training session or manual log.
- **Category & Exercise Selection:** Users select from primary muscle group directories (e.g., Chest, Back, Legs, Arms) to add exercises to their session.
- **Smart Set Prefill (1-Set Behavior):** To minimize manual entry fatigue, the app dynamically consults the user's past training logs:
  - If historical recordings are available, the logger retrieves properties from the **last completed set** (cloning reps, weights, levels, or durations).
  - If no historical data is found, standard baseline defaults (e.g., 10 reps, 0 weight) are pre-populated.
  - The production app maintains exactly **1 smart default set** to avoid screen clutter. Users append supplementary sets instantly via the "+ Add Set" button.
- **Logging Set Telemetry:** Users enter parameters mapped directly to the exercise's dynamic `LoadType` (e.g., Weight & Reps, Cardio, Bodyweight).

### 4.2. Rest Notification Timer
- Completing a set under `LIVE` mode fires a visual rest timer.
- Resting intervals default to 90 seconds (customizable upon trigger).
- Once the timer expires, the app triggers sound files based on user preferences.
- Rest timers do not engage automatically inside retroactive `MANUAL` back-logging sessions.

### 4.3. Workout Templates
To facilitate streamlined session planning, users can manage reusable workout skeletons called templates/routines:
- **Scope:** Planning includes pre-selecting categories and exercise types. Weights, reps, and set counts are omitted during templated planning, as these are automatically populated during session activation based on historical logs or standard defaults.
- **Creation from History:** Users can choose any past completed workout from their History log and save it as a routine. This automatically imports all exercises of that past session into the template.
- **Template Management:** Routines are visible in a dedicated "Workout Templates" section on the Dashboard. Users can click any template to preview its exercises, start a LIVE session, record a MANUAL backlog, edit, or delete the template.

---

## 5. Exercise Management

### 5.1. Global / Admin Exercises
- Administrators manage the official global exercises catalog available to every user.
- Global additions include custom image assets uploaded securely to Firebase Storage.

### 5.2. Custom Exercises
- **On-The-Fly Generation:** Users can create custom exercises directly from the exercise category selection screen.
- **User Scoping:** Custom exercises are strictly isolated and visible only to their creator.
- **Migration & De-Duplication:** Admins or users can merge custom exercises into newly created global equivalents, migrating past histories to the official ID and deleting the custom record to keep the catalog clean.

---

## 6. History and Analytics

### 6.1. High-Fidelity History Logs
- The **History** view lists all compiled training sessions.
- Users can expand sessions to review specific exercises, sets, weights, and logs.
- **Retroactive Correction:** Completed workouts are completely editable. Users can update metrics, add/delete sets, or remove sessions entirely.

### 6.2. Progression Analytics
- The **Progress** view enables drilling down into specific exercises.
- Displays responsive line charts mapping lifting volumes, machine resistance levels, or durations across past training sequences.
- Shows maximum metrics (Best Weight/Level), average repetitions, and overall set volume alongside the chart.

---

## 7. User Settings
Users have a dedicated settings view to customize their app experience:
- **Language:** Toggle the interface language (e.g., English, Bulgarian).
- **Font Size:** Adjust the global UI font size for accessibility and readability.
- **Notifications Enabled:** Toggle the ability for the app to send rest timer notifications.
- **Notification Sound:** Select from various offline sound profiles (e.g., Happy bells, Opening Bell, Uplifting bells) to play when a rest timer expires.

---

## 8. Platform Administration (Public/Private Mode)
The platform features a global administrative system gate:
- **State Toggles:** Admins can set the platform to "Private" mode.
- **Standard User Lockdown:** When private mode is active, standard users attempting to access the platform are intercepted by a secure lock banner and prevented from accessing core app features.
- **Admin Pass-Through:** Administrator accounts bypass the lockdown layer, allowing testing of deployments or content uploads securely before opening public access.
