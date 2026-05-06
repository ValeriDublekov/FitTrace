# Security Specification: Fitness Tracker Admin Access

## 1. Data Invariants
- An exercise must have a name, category, and load type.
- Only users listed in the `admins` collection can create, update, or delete exercises.
- Exercise thumbnails must be valid URLs from Firebase Storage (conceptually).
- `createdAt` is immutable.
- `updatedAt` must be set on update.
- **Global Settings (`/settings/global`) must have `isPublic`, `updatedAt`, and `updatedBy`.**
- **Only Admins can modify global settings.**
- **User Settings (`/users/{userId}/settings/display`) must have `fontSize` and `updatedAt`.**
- **Users can only manage their own settings.**

## 2. The "Dirty Dozen" (Red Team Payloads)

1. **Anonymous Write:** Unauthenticated user attempts to create an exercise.
2. **Spoofed Admin Write:** Authenticated but non-admin user attempts to create an exercise.
3. **Ghost Field Injection:** Admin attempts to add a hidden field `isFeatured: true` to an exercise.
4. **Huge ID Poisoning:** Admin (or attacker) attempts to create an exercise with a 2MB string as its ID.
5. **PII Leak:** User attempts to read another user's workout data.
6. **Self-Promotion:** User attempts to write their own document in the `admins` collection.
7. **Settings Hijack:** Non-admin user attempts to set `isPublic: true` on `/settings/global`.
8. **Settings Malformation:** Admin attempts to update settings without providing `updatedBy`.
9. **Immutability Breach:** Admin attempts to change the `createdAt` timestamp of an existing exercise.
10. **Type Poisoning:** Admin attempts to set `loadType` to "SQUAT" (not in enum).
11. **Missing Mandatory Fields:** Admin attempts to create an exercise without a `category`.
12. **Denial of Wallet:** Attacker attempts to list all workouts without a `userId` filter.

## 3. Test Runner (firestore.rules.test.ts)

```typescript
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'fit-trace-test',
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
    }
  });
});

test('Anonymous user cannot create exercises', async () => {
  const alice = testEnv.unauthenticatedContext();
  await assertFails(alice.firestore().collection('exercises').add({ name: 'Bench Press' }));
});

test('Non-admin user cannot create exercises', async () => {
  const bob = testEnv.authenticatedContext('bob');
  await assertFails(bob.firestore().collection('exercises').add({ name: 'Bench Press' }));
});

test('Verified admin can create exercises', async () => {
  // Pre-seed admin doc
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().doc('admins/admin_uid').set({ email: 'admin@test.com', createdAt: new Date() });
  });

  const admin = testEnv.authenticatedContext('admin_uid');
  await assertSucceeds(admin.firestore().collection('exercises').add({
    name: 'Bench Press',
    category: 'Chest',
    loadType: 'WEIGHT_REPS',
    createdAt: serverTimestamp()
  }));
});
```
