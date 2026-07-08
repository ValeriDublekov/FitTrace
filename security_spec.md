# Security Specification: Fitness Tracker Admin Access

## Firestore Collections

- **admins**: Document-based list of user IDs that represent the application's administrators. This is the single source of truth for administrative rights.
- **settings/global**: Global application configurations.
- **exercises**: Database of both global (system) exercises and custom user-created exercises.
- **workouts**: Database of user-specific workout log sessions.
- **workout_templates**: Database of user-created reusable workout routines.
- **users/{userId}/settings/display**: Individual user preferences (e.g. font size, language settings).

## Security Invariants

### Global Role & Identity Helpers

- **isSignedIn()**: Asserts that `request.auth` is not null.
- **isOwner(userId)**: Asserts that the authenticated user's UID precisely matches the resource-scoped `userId`.
- **isAdmin()**: Returns `true` if the user's UID exists as a document in the `/admins` collection (which serves as the single source of truth for administrative rights).
- **isValidId(id)**: Enforces string format boundaries on ID values (max 128 characters, matching alphanumerics, hyphens, and underscores).

---

### Collection-Specific Rules & Invariants

#### 1. admins (`/admins/{userId}`)

- **Read Access**: Readable only if the authenticated user is the document owner (`isOwner(userId)`) or is an existing Admin (`isAdmin()`).
- **Write Access**: Strictly blocked from direct client-side mutations (`allow write: if false;`). This ensures roles must be managed securely through administrative consoles or backend services.

#### 2. settings/global (`/settings/global`)

- **Read Access**: Open to all users (`allow read: if true;`).
- **Write Access**: Allowed only for authorized Admins (`isAdmin()`) who submit valid payload shapes.
- **Validation**: Enforces strict key presence matching exactly three fields:
  - `isPublic` (boolean)
  - `updatedAt` (timestamp)
  - `updatedBy` (string mapping to the user's UID)

#### 3. exercises (`/exercises/{exerciseId}`)

- **Read Access**: Any signed-in user can read global exercises (`isCustom == false` or missing) or custom exercises that they created (`userId == request.auth.uid`). Global exercises are separated from custom ones to prevent cross-user data leakage.
- **Create Access**: Signed-in Admins can create global exercises (`isCustom == false`). Non-admin signed-in users can only create custom exercises (`isCustom == true` and `userId == request.auth.uid`).
- **Update Access**:
  - Admins can update global exercises (`isCustom == false`).
  - Creators of custom exercises can update their own custom exercises, provided that `isCustom` remains `true` and the `userId` is unchanged.
  - Updates are constrained to a strict set of allowed fields: `['name', 'category', 'loadType', 'thumbnailUrl', 'defaultNotes', 'description', 'url', 'updatedAt', 'userId', 'isCustom', 'affectedPart']`.
  - The `updatedAt` field must match the server's transaction timestamp (`request.time`).
- **Delete Access**: Admins can delete any exercise; custom creators can delete their own custom exercises.
- **Validation Details (`isValidExercise`)**:
  - Requires: `name` (string <= 200 chars), `category` (string <= 100 chars), `loadType` (one of `'WEIGHT_REPS'`, `'LEVEL_REPS'`, or `'CARDIO'`), and `isCustom` (boolean).
  - Optional fields allowed: `thumbnailUrl`, `defaultNotes`, `description` (<= 10000 chars), `updatedAt` (timestamp), `userId`, `url`, `id`, `createdAt` (timestamp), and `affectedPart` (string <= 200 chars).
  - Immutable fields: `createdAt` cannot be modified after initial creation.

#### 4. workouts (`/workouts/{workoutId}`)

- **Read/List Access**: Accessible only to the creator of the workout session (`resource.data.userId == request.auth.uid`). There are no blanket read/list operations.
- **Create/Update Access**: Restructured to prevent spoofing. Users can only write/update workouts where `userId` matches their UID and the payload matches the strict validation schema.
- **Delete Access**: Allowed only for the workout's author.
- **Validation Details (`isValidWorkout`)**:
  - Keys must include: `userId`, `date`, `exercises`.
  - Maximum size enforced: `exercises` list is bounded to `<= 30` items. Each exercise item must have `<= 50` sets.
  - `userId` must strictly align with `request.auth.uid`.
  - `date`, `startedAt`, and `updatedAt` must be valid timestamps.
  - Allows `notes` (string <= 10000 chars) and `durationSeconds` (int).

#### 5. workout_templates (`/workout_templates/{templateId}`)

- **Read/List Access**: Accessible only to the creator of the template (`resource.data.userId == request.auth.uid`).
- **Create/Update Access**: Users can only create or update templates where `userId` matches their UID and the payload adheres to the validation rules.
- **Delete Access**: Allowed only for the template's author.
- **Validation Details (`isValidWorkoutTemplate`)**:
  - Keys must include: `userId`, `name`, `exerciseIds`, `createdAt`.
  - `userId` must strictly align with `request.auth.uid`.
  - `name` must be a string <= 200 chars.
  - `exerciseIds` must be a list of strings with a maximum size of 50.
  - `createdAt` must be a valid timestamp.

#### 6. users/{userId}/settings/display (`/users/{userId}/settings/display`)

- **Read Access**: Only accessible to the document owner (`isOwner(userId)`).
- **Write Access**: Only writeable by the owner (`isOwner(userId)`), must include `updatedAt` equal to `request.time`.
- **Validation Details (`isValidUserSettings`)**:
  - Keys MUST NOT include any unknown fields. Only `updatedAt`, `fontSize`, `language`, `notificationSound`, and `isNotificationsEnabled` are allowed.
  - Must include `updatedAt` (timestamp).
  - `fontSize` must be `'normal'`, `'large'`, or `'xlarge'` if present.
  - `language` must be `'bg'` or `'en'` if present.
  - `notificationSound` must be a string <= 200 chars if present.
  - `isNotificationsEnabled` must be a boolean if present.

---

## Test Status

No automated executable rules tests exist for this project. Security validation relies on strict schema checks and manual verification. A manual testing checklist (`FIREBASE_EMULATOR_CHECKLIST.md`) can be used during local emulation to verify the invariants.
