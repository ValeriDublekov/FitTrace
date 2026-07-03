# Firebase Integration & Configuration Guide

This application integrates Firebase for user authentication, cloud data persistence (Firestore), and asset storage. Follow this guide to set up your own Firebase environment.

---

## 1. Firebase Authentication Setup
The application uses **Firebase Authentication** primarily via **Google Sign-In**. 

### Steps to Configure Auth:
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Create a new Firebase project or select an existing one.
3. Access the menu under **Build > Authentication** and click **Get Started**.
4. In the **Sign-in method** tab, select **Google** from the passwordless/provider list.
5. Toggle the **Enable** switch, configure a support email, and save your changes.

---

## 2. Firestore Database Provisioning & Schema
The application requires **Cloud Firestore** in Native mode.

### Steps to Configure Firestore:
1. Access the menu under **Build > Firestore Database** in the console.
2. Click **Create database**, select your region, and choose starting security rules in **Production mode**.
3. Deploy the local `firestore.rules` rules file to secure your collections against unauthorized access.

### Required Collections & Document Schema

#### `/admins/{userId}`
Represents users with system administrative rights (allowed to manage system-wide exercises and global settings). This collection is the single source of truth for administrative privileges across both the frontend React application and Firestore security rules.
- **Doc ID**: The user's Firebase Authentication UID.
- **Fields**:
  - `email`: `string` — The verified administrator email.
  - `createdAt`: `timestamp` — Date and time when the admin was verified.

#### `/settings/global`
Single document containing global configurations for the application.
- **Collection**: `settings`
- **Document ID**: `global`
- **Fields**:
  - `isPublic`: `boolean` — Controls public access permission overrides.
  - `updatedAt`: `timestamp` — Server timestamp of the last edit.
  - `updatedBy`: `string` — UID of the admin making the change.

#### `/exercises/{exerciseId}`
Stores both global (system) exercises created by administrators and custom exercises created by individual users.
- **Doc ID**: Auto-generated string ID.
- **Fields**:
  - `name`: `string` — Name of the exercise.
  - `category`: `string` — Exercise category (e.g., Chest, Back, Legs).
  - `loadType`: `string` — Enum value: `'WEIGHT_REPS'`, `'LEVEL_REPS'`, or `'CARDIO'`.
  - `isCustom`: `boolean` — `true` if created by a user, `false` if a global preset.
  - `userId`: `string | null` — UID of the creator if `isCustom` is `true`.
  - `thumbnailUrl`: `string | null` — Relative or absolute URL to the exercise image.
  - `description`: `string | null` — Text describing performance technique.
  - `defaultNotes`: `string | null` — Default user guidelines.
  - `affectedPart`: `string | null` — Targeted muscle group descriptor.
  - `createdAt`: `timestamp` — Creation timestamp.

#### `/workouts/{workoutId}`
Houses workout sessions logged by users. Only visible to the creator.
- **Doc ID**: Auto-generated workout session ID.
- **Fields**:
  - `userId`: `string` — UID matching the authenticating user.
  - `date`: `timestamp` — Workout performance date.
  - `notes`: `string | null` — Session performance reviews.
  - `exercises`: `array` of exercise logs (items contain logs of sets, level, reps, and weights).

#### `/users/{userId}/settings/display`
User preference settings document containing personalized visual, UX, and PWA options.
- **Doc ID**: `display` (nested under the `settings` subcollection of a specific user)
- **Fields**:
  - `fontSize`: `string` — Set to `'normal'`, `'large'`, or `'xlarge'`.
  - `language`: `string` — Active locale code (e.g. `'bg'`, `'en'`).
  - `updatedAt`: `timestamp` — Last update transaction time.
  - `notificationSound`: `string | null` — Key of the selected sound for rest alerts.
  - `isNotificationsEnabled`: `boolean | null` — If notifications permission state is active.

---

## 3. Firebase Storage Configuration
The fitness companion application utilizes **Firebase Storage** to host exercise icons, thumbnails, and custom uploads.

### Steps to Configure Storage:
1. Access the menu under **Build > Storage**.
2. Click **Get Started**, choose your storage region, and initialize.
3. Select the **Rules** tab in the Storage view and update the rules to permit public read access of static files while restricting uploads to logged-in system administrators:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /exercises/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
  }
}
```

---

## 4. Setting Up Local Credentials
To hook up your application to the live database, fetch the application credentials from your project settings:
1. Go to **Project Settings > General** in the Firebase Console.
2. Under "Your apps", select the **Web App** (or register one if not yet done).
3. Copy the configuration script details and create/update the `firebase-applet-config.json` file in the root of your workspace:

```json
{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_PROJECT_ID.firebaseapp.com",
  "projectId": "YOUR_PROJECT_ID",
  "storageBucket": "YOUR_PROJECT_ID.firebasestorage.app",
  "messagingSenderId": "YOUR_SENDER_ID",
  "appId": "YOUR_APP_ID",
  "firestoreDatabaseId": "(default)"
}
```
