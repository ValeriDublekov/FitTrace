# Security Specification: Fitness Tracker Admin Access

## Firestore Collections
- **admins**: Document-based list of user IDs that represent the application's administrators.
- **settings/global**: Global application configurations.
- **exercises**: Database of both global (system) exercises and custom user-created exercises.
- **workouts**: Database of user-specific workout log sessions.
- **users/{userId}/settings/display**: Individual user preferences (e.g. font size, language settings).

## Security Invariants

### Global Role & Identity Helpers
- **isSignedIn()**: Asserts that `request.auth` is not null.
- **isOwner(userId)**: Asserts that the authenticated user's UID precisely matches the resource-scoped `userId`.
- **isAdmin()**: Returns `true` if any of the following are met:
  1. The user's UID exists as a document in the `/admins` collection.
  2. The user's authenticated Google Account email is `v.dublekov@gmail.com` (verified) as an intentional fallback mechanism.
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
- **Read Access**: Any signed-in user can read global exercises (`isCustom == false` or missing) or custom exercises that they created (`userId == request.auth.uid`).
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
- **Create/Update Access**: Restructured to prevent spoofing. Users can only write/update workouts where `userId` matches their UID and the array of exercises is bounded to the standard performance limits (`<= 30` items).
- **Delete Access**: Allowed only for the workout's author.
- **Validation Details (`isValidWorkout`)**:
  - Keys must include: `userId`, `date`, `exercises` (list of <= 30 items).
  - `userId` must strictly align with `request.auth.uid`.
  - `date` must be a valid timestamp.

#### 5. users/{userId}/settings/display (`/users/{userId}/settings/display`)
- **Read Access**: Only accessible to the document owner (`isOwner(userId)`).
- **Write Access**: Only writeable by the owner (`isOwner(userId)`), must include `updatedAt` equal to `request.time`.
- **Validation Details (`isValidUserSettings`)**:
  - Must include `updatedAt` (timestamp).
  - Must contain at least one of `fontSize` or `language`.
  - If `fontSize` is specified, it must be value `'normal'`, `'large'`, or `'xlarge'`.
  - Custom client options such as `notificationSound` and `isNotificationsEnabled` are permitted as long as they are verified at runtime.

---

## Test Status
No executable rules tests exist yet. All security rules are validated via live sandbox deployments and strict schema checks in deployment rules verification.
