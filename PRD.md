# Product Requirements Document (PRD): Fitness Tracker PWA

## 1. Overview
A Progressive Web App (PWA) designed for Android (but responsive for desktop) to track gym workouts. The app focuses on a flexible workout structure where the user selects exercises "on the fly" during a session, logs sets based on dynamic load types, tracks rest times, and views historical progress.

## 2. Target Audience & Roles
- **Standard User:** Can start workouts, log sets, use the rest timer, and view their progress history. 
- **Admin User:** Can manage the global exercise database (add, edit, upload thumbnails). Admin rights are determined via a backend Firestore collection, not hardcoded.

## 3. Key Features & User Flows

### 3.1. Authentication & Admin Access
- User logs in via Google Auth.
- The app checks if the user's UID exists in the `admins` Firestore collection.
- New signups are technically possible via Google, but only Admins can create/edit exercises. (Eventually, standard users will only see data, but currently, it's a single-user focused app).

### 3.2. Admin: Exercise Management
- **Add/Edit Exercise:** Admin can define Name, Category (Chest, Back, Legs, Arms, etc.), Notes, and `LoadType`.
- **Image Upload:** Admin can upload a thumbnail image (via Firebase Storage) so exercises are easily recognizable without reading.
- **Load Types:** 
  - `WEIGHT_REPS`: Standard weights (e.g., Dumbbells, Bench press) -> Requires Weight (kg) and Reps.
  - `LEVEL_REPS`: Machines with levels (e.g., Kinesis) -> Requires Level (1, 2, 3) and Reps.
  - `CARDIO`: Treadmill/Bike -> Requires Difficulty/Speed and Time/Distance.

### 3.3. Core Workout Flow
1. **Start Session:** User clicks "New Workout".
2. **Select Category:** User selects the muscle group (e.g., "Chest & Triceps").
3. **Select Exercise:** A visual list of exercises (with uploaded thumbnails) appears. Offline-first: this list must load even with poor gym internet.
4. **Log Sets:**
   - App fetches and displays the user's *full history/best lift* for this specific exercise.
   - UI pre-fills 3 empty sets by default.
   - User inputs data based on the `LoadType` (e.g., 5kg, 10 reps).
   - User can add a custom note for this specific session.
   - User clicks "Complete Set".
5. **Rest Timer:** Marking a set as complete triggers an automatic rest timer (e.g., 90 seconds) displayed non-intrusively.
6. **Finish Workout:** Saves the entire session to the user's history.

### 3.4. Progress & Analytics
- **History View:** User selects an exercise and sees a complete historical log.
- **Charts:** A line chart (using Recharts) visualizes weight/level progression over time for a selected exercise.

### 3.5. Non-Functional Requirements
- **Offline Mode:** Must handle poor internet connection gracefully using Firestore local persistence and PWA Service Workers.
## Status Tracking
- **Phase 1: Basic Foundation:** COMPLETED
- **Phase 2: Workout Flow (Logger):** COMPLETED
- **Phase 3: History & Progress:** PENDING
