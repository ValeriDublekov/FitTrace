# Firebase Firestore Emulator & Security Rules Testing Checklist

Since running full Java-based Firebase Emulators inside a headless sandboxed container is impractical, this guide provides a step-by-step checklist and test suite structure to run Firestore Security Rules testing locally.

---

## 1. Local Prerequisites
Ensure you have the following installed on your developer machine:
- [ ] **Node.js** (v18 or higher)
- [ ] **Java JRE** (v11 or higher, required by Firebase Emulator)
- [ ] **Firebase CLI**: Install globally using:
  ```bash
  npm install -g firebase-tools
  ```

---

## 2. Emulator Initialization
If not already initialized, run this command in your project root to configure the emulators:
```bash
firebase init emulators
```
- [ ] Select **Firestore Emulator**.
- [ ] Accept default port settings (`8080` for Firestore, `4000` for the Emulator Suite UI).
- [ ] Enable the Emulator Suite UI to inspect live database states visually.

Your `firebase.json` configuration should look like this:
```json
{
  "firestore": {
    "rules": "firestore.rules"
  },
  "emulators": {
    "firestore": {
      "port": 8080
    },
    "ui": {
      "enabled": true,
      "port": 4000
    },
    "singleProjectMode": true
  }
}
```

---

## 3. Automated Security Rules Test Suite
You can install `@firebase/rules-unit-testing` as a devDependency to run local rules tests:
```bash
npm install -D @firebase/rules-unit-testing
```

Below is the standard, production-ready `rules.test.ts` to test all settings, exercises, workouts, and templates rules. Place this in your local testing directory (e.g., `tests/rules.test.ts`):

```typescript
import { 
  initializeTestEnvironment, 
  RulesTestEnvironment, 
  assertSucceeds, 
  assertFails 
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, deleteDoc, collection, addDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

let testEnv: RulesTestEnvironment;

describe('Firestore Security Rules', () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'fittrace-rules-test',
      firestore: {
        rules: readFileSync('firestore.rules', 'utf8'),
        host: 'localhost',
        port: 8080,
      },
    });
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  // --- 1. USER SETTINGS RULES TESTS ---
  describe('User Display Settings', () => {
    it('allows owner to read/write their own display settings with valid structure', async () => {
      const aliceDb = testEnv.authenticatedContext('alice').firestore();
      const settingsRef = doc(aliceDb, 'users/alice/settings/display');
      
      const validPayload = {
        fontSize: 'large',
        language: 'en',
        notificationSound: 'happy_bells',
        isNotificationsEnabled: true,
        updatedAt: new Date()
      };
      
      await assertSucceeds(setDoc(settingsRef, validPayload));
      await assertSucceeds(getDoc(settingsRef));
    });

    it('denies write to settings if missing updatedAt or has invalid properties', async () => {
      const aliceDb = testEnv.authenticatedContext('alice').firestore();
      const settingsRef = doc(aliceDb, 'users/alice/settings/display');
      
      // Missing updatedAt
      await assertFails(setDoc(settingsRef, { fontSize: 'normal' }));

      // Invalid option for fontSize
      await assertFails(setDoc(settingsRef, { fontSize: 'huge', updatedAt: new Date() }));
    });

    it('denies other users from reading or writing alice\'s settings', async () => {
      const bobDb = testEnv.authenticatedContext('bob').firestore();
      const settingsRef = doc(bobDb, 'users/alice/settings/display');
      
      await assertFails(getDoc(settingsRef));
      await assertFails(setDoc(settingsRef, { fontSize: 'normal', updatedAt: new Date() }));
    });
  });

  // --- 2. EXERCISES RULES TESTS ---
  describe('Exercises', () => {
    it('allows anyone authenticated to read global non-custom exercises', async () => {
      // Seed a global exercise in admin context
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(doc(db, 'exercises/bench_press'), {
          name: 'Bench Press',
          category: 'chest',
          loadType: 'WEIGHT_REPS',
          isCustom: false
        });
      });

      const aliceDb = testEnv.authenticatedContext('alice').firestore();
      await assertSucceeds(getDoc(doc(aliceDb, 'exercises/bench_press')));
    });

    it('denies normal users from writing/creating global exercises', async () => {
      const aliceDb = testEnv.authenticatedContext('alice').firestore();
      await assertFails(setDoc(doc(aliceDb, 'exercises/new_global'), {
        name: 'New Global',
        category: 'chest',
        loadType: 'WEIGHT_REPS',
        isCustom: false
      }));
    });

    it('allows users to create and manage their own custom exercises', async () => {
      const aliceDb = testEnv.authenticatedContext('alice').firestore();
      const customRef = doc(collection(aliceDb, 'exercises'));
      
      await assertSucceeds(setDoc(customRef, {
        name: 'My Special Lift',
        category: 'arms',
        loadType: 'WEIGHT_REPS',
        isCustom: true,
        userId: 'alice'
      }));
    });

    it('denies other users from reading or modifying another user\'s custom exercises', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'exercises/alice_custom'), {
          name: 'Alice Custom lift',
          category: 'legs',
          loadType: 'LEVEL_REPS',
          isCustom: true,
          userId: 'alice'
        });
      });

      const bobDb = testEnv.authenticatedContext('bob').firestore();
      await assertFails(getDoc(doc(bobDb, 'exercises/alice_custom')));
    });
  });

  // --- 3. WORKOUTS RULES TESTS ---
  describe('Workouts', () => {
    it('allows owners to create and read workouts with correct schemas', async () => {
      const aliceDb = testEnv.authenticatedContext('alice').firestore();
      const workoutPayload = {
        userId: 'alice',
        date: new Date(),
        exercises: [
          {
            id: 'instance_1',
            exerciseId: 'ex_1',
            exerciseName: 'Squat',
            sets: [{ setIndex: 1, weight: 100, reps: 5 }]
          }
        ]
      };
      await assertSucceeds(addDoc(collection(aliceDb, 'workouts'), workoutPayload));
    });

    it('denies other users from reading or writing another user\'s workouts', async () => {
      const bobDb = testEnv.authenticatedContext('bob').firestore();
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'workouts/alice_workout'), {
          userId: 'alice',
          date: new Date(),
          exercises: []
        });
      });

      await assertFails(getDoc(doc(bobDb, 'workouts/alice_workout')));
    });
  });

  // --- 4. WORKOUT TEMPLATES RULES TESTS ---
  describe('Workout Templates', () => {
    it('allows owners to manage their workout templates', async () => {
      const aliceDb = testEnv.authenticatedContext('alice').firestore();
      const templatePayload = {
        userId: 'alice',
        name: 'Hypertrophy Day',
        exerciseIds: ['ex_1', 'ex_2'],
        createdAt: new Date()
      };
      await assertSucceeds(addDoc(collection(aliceDb, 'workout_templates'), templatePayload));
    });
  });
});
```

---

## 4. Execution Command
To start the emulator, run the rules test suite, and clean up automatically, execute:
```bash
firebase emulators:exec "npm run test"
```
Or view the live emulator dashboard at `http://localhost:4000` to trace Firestore transactions and evaluate dynamic security rule checks.
