<!-- markdownlint-disable MD013 -->

# FitTrace AI Execution Prompts

Този файл е работен план за изпълнение в онлайн AI среда с по-малък модел.
Подай всяка стъпка като отделен prompt. Не прескачай валидацията в края на
стъпката, защото следващите prompts разчитат на стабилно състояние.

## Execution Status (As of 2026-07-08)

All steps of the AI Execution plan have been successfully completed and validated:

| Step | Goal / Area | Status | Notes |
| :--- | :--- | :--- | :--- |
| Step 01 | Freeze Baseline | **COMPLETED** | Established the baseline status. |
| Step 02 | Fix User Settings Rules | **COMPLETED** | Updated firestore.rules and display. |
| Step 03 | Decide Admin Source Of Truth | **COMPLETED** | Set `admins/{uid}` as single source of truth. |
| Step 04 | Tighten Workout/Template Rules | **COMPLETED** | Added exact payload shape validation to rules. |
| Step 05 | Type Exercise Mutation Payloads | **COMPLETED** | Removed `any` from exercises mutations. |
| Step 06 | Type Firestore Serialization Helpers | **COMPLETED** | Added recursive unknown type-safe serialization. |
| Step 07 | Type PWA Install Hook | **COMPLETED** | Fully typed `usePWAInstall` with proper event interface. |
| Step 08 | Clean Small Unsafe Casts | **COMPLETED** | Cleaned `as any` and handled `unknown` catches. |
| Step 09 | Split Persisted And Draft Types | **COMPLETED** | Introduced clean type interfaces/generics (`WithId`). |
| Step 10 | Extract Workout Session Persistence | **COMPLETED** | Extracted localStorage hook & state persistence. |
| Step 11 | Extract Workout Session Mutations | **COMPLETED** | Extracted mutations logic to dedicated hook. |
| Step 12 | Extract Finish Workout Flow | **COMPLETED** | Extracted useFinishWorkout with clear save/error lifecycle. |
| Step 13 | Split Workout Context Read & Actions | **COMPLETED** | Created separate state and actions contexts. |
| Step 14 | Reduce App Data Provider Breadth | **COMPLETED** | Split settings and exercises; memoized callbacks. |
| Step 15 | Add Minimal Test Harness | **COMPLETED** | Integrated Vitest and added initial tests. |
| Step 16 | Add Rules And Payload Tests | **COMPLETED** | Covered serialization and settings validations. |
| Step 17 | Add Workout Session Regression Tests | **COMPLETED** | Added complete regression tests for workout session. |
| Step 18 | Enable Strict TypeScript | **COMPLETED** | Enabled strict mode in tsconfig; cleared all issues. |
| Step 19 | Improve Firestore Error Handling | **COMPLETED** | Implemented typed `FirestoreAppError` class. |
| Step 20 | Clean Debug Logging | **COMPLETED** | Cleared console logs or gated behind DEV environment check. |
| Step 21 | Update Technical Debt Document | **COMPLETED** | Updated TECHNICAL_DEBT.md accurately. |
| Step 22 | Update Architecture Document | **COMPLETED** | Aligned ARCHITECTURE.md with current code patterns. |
| Step 23 | Update PRD | **COMPLETED** | Updated PRD.md to reflect the fully polished PWA. |
| Step 24 | Update Firebase & Security Docs | **COMPLETED** | Aligned docs with final security policies and rules. |
| Step 25 | Final Validation & Plan Cleanup | **COMPLETED** | Performed final validation check (Linter, Build, Tests, Markdown). |

## Общи Правила За Всеки Prompt

- Работи само по файловете, посочени в конкретната стъпка.
- Не прави широк refactor извън описания обхват.
- Не поправяй несвързани бъгове, освен ако блокират стъпката.
- След промяна пускай посочената валидация.
- Ако `npm run lint` или `npm run build` fail-не заради стар проблем, запиши го
  в отговора и не го прикривай с unrelated промени.
- Ако промяна засяга Firestore schema, rules или core flow, обнови съответната
  документация в отделната docs стъпка, освен ако prompt-ът изрично казва друго.
- Запази текущия факт: `exerciseService.getExercises()` вече използва отделни
  rule-safe заявки, а `useExerciseHistory()` вече се derive-ва от live workout
  history. Не ги третирай като непоправени бъгове.

## Step 01 - Freeze Baseline

**Цел:** установи текущото validation състояние преди промени.

**Файлове:**

- `validation_baseline.md`
- `package.json`
- `tsconfig.json`

**Prompt:**

```text
Analyze the current validation baseline before making code changes.

Run:
1. npm run lint
2. npm run build
3. npx -y markdownlint-cli ./*.md

Update validation_baseline.md with the current date, commands, pass/fail status,
and the important failures. Do not change application code in this step.

Important context:
- exerciseService.getExercises() is already split into rule-safe global/custom queries.
- useExerciseHistory() is already derived from live WorkoutHistoryProvider state.
- Treat those as regression areas, not active bugs.
```

**Валидация:** няма допълнителна. Тази стъпка сама записва baseline.

**Stop Condition:** `validation_baseline.md` съдържа актуален резултат от трите
команди.

## Step 02 - Fix User Settings Rules

**Цел:** поправи Firestore rules mismatch за user settings.

**Файлове:**

- `firestore.rules`
- `src/context/AppDataContext.tsx`
- `src/types/index.ts`

**Prompt:**

```text
Fix the Firestore user settings validation mismatch.

Problem:
AppDataContext writes fontSize, language, notificationSound, and
isNotificationsEnabled independently, but firestore.rules currently validates
only fontSize/language-style settings. First-time writes for notificationSound
or isNotificationsEnabled can be rejected.

Tasks:
1. Update isValidUserSettings() in firestore.rules to allow only these fields:
   fontSize, language, notificationSound, isNotificationsEnabled, updatedAt.
2. Validate field types and allowed values:
   - fontSize: normal | large | xlarge
   - language: bg | en
   - notificationSound: string
   - isNotificationsEnabled: boolean
   - updatedAt: timestamp
3. Allow partial settings updates as long as updatedAt exists and all provided
   fields are valid.
4. Check AppDataContext writes still match the rules. Change app code only if
   needed for rules compatibility.

Keep the change narrow. Do not refactor providers in this step.
```

**Валидация:**

```bash
npm run lint
```

**Manual Check:** в приложението промени language, font size, notification sound
и notification enabled toggle за потребител без предварително settings document.

**Stop Condition:** rules приемат всички user settings writes, а `npm run lint`
минава или показва само предварително известен baseline проблем.

## Step 03 - Decide Admin Source Of Truth

**Цел:** уеднакви admin логиката между UI и Firestore rules.

**Файлове:**

- `firestore.rules`
- `src/context/AppDataContext.tsx`
- `security_spec.md`
- `FIREBASE_GUIDE.md`

**Prompt:**

```text
Align admin authorization between the UI and Firestore rules.

Problem:
firestore.rules currently treats a verified hardcoded email as admin, while the
React app checks only whether admins/{uid} exists. This can create users who are
admins in rules but not admins in UI, or vice versa.

Preferred decision:
Use admins/{uid} documents as the single source of truth and remove the
hardcoded email bypass from firestore.rules.

Tasks:
1. Remove the hardcoded email admin bypass from isAdmin() in firestore.rules,
   unless there is a documented reason to keep it.
2. Confirm AppDataContext/useAdmin already matches admins/{uid} ownership.
3. Update security_spec.md and FIREBASE_GUIDE.md to document the chosen admin
   model.
4. Do not change unrelated auth or route logic.
```

**Валидация:**

```bash
npm run lint
```

**Manual Check:** verify one admin UID can access `/admin`, and one non-admin UID
is redirected away.

**Stop Condition:** UI and rules use the same admin source of truth.

## Step 04 - Tighten Workout And Template Rules

**Цел:** направи Firestore validation по-строга и съвместима с реалните payload-и.

**Файлове:**

- `firestore.rules`
- `src/services/workoutService.ts`
- `src/services/templateService.ts`
- `src/types/index.ts`

**Prompt:**

```text
Tighten Firestore rules for workouts and workout_templates without changing app
behavior.

Tasks:
1. Update isValidWorkout() to reject arbitrary extra top-level fields.
2. Validate optional workout fields that the app writes: notes, startedAt,
   durationSeconds, updatedAt.
3. Validate exercises as a list with reasonable nested field checks for:
   id, exerciseId, exerciseName, sessionNotes, sets, startedAt,
   durationSeconds, affectedPart, supersetGroupId.
4. Validate each set field: setIndex, weight, level, reps, duration,
   isCompleted.
5. Update isValidWorkoutTemplate() to reject extra fields and match
   templateService payloads.
6. If app payloads and rules disagree, prefer a minimal app payload fix over
   weakening rules.

Do not introduce a test framework in this step.
```

**Валидация:**

```bash
npm run lint
npm run build
```

**Manual Check:** save workout, edit workout, delete workout, save template,
edit template, delete template.

**Stop Condition:** app payloads still work, and rules no longer accept
unvalidated arbitrary fields.

## Step 05 - Type Exercise Mutation Payloads

**Цел:** премахни `any` от exercise mutation path.

**Файлове:**

- `src/context/AppDataContext.tsx`
- `src/services/exerciseService.ts`
- `src/types/index.ts`

**Prompt:**

```text
Remove any from the exercise create/update mutation path.

Problem:
AppDataContext uses exerciseData: any when normalizing admin-created global
exercises versus user-created custom exercises.

Tasks:
1. Add small typed helper functions or local types for exercise create/update
   payload normalization.
2. Preserve the invariants:
   - admin/global exercise: isCustom false, no user-owned custom data required
   - user/custom exercise: isCustom true, userId is current user UID
3. Keep exerciseService.getExercises() rule-safe behavior unchanged.
4. Do not split AppDataProvider in this step.
```

**Валидация:**

```bash
npm run lint
```

**Manual Check:** create/edit global exercise as admin and create/edit custom
exercise as normal user.

**Stop Condition:** no `exerciseData: any` remains in `AppDataContext.tsx`.

## Step 06 - Type Firestore Serialization Helpers

**Цел:** премахни broad `any` от workout serialization.

**Файлове:**

- `src/services/workoutService.ts`
- `src/types/index.ts`

**Prompt:**

```text
Replace broad any usage in workoutService with typed serialization helpers.

Problem:
workoutService uses cleanUndefined(obj: any): any and firestoreUpdates: any.

Tasks:
1. Replace cleanUndefined(any) with a helper based on unknown and structured
   object/array recursion.
2. Type update payload preparation without using any.
3. Preserve Date to Timestamp conversion behavior.
4. Preserve removal of undefined fields and id before Firestore writes.
5. Do not change workout behavior or Firestore collection names.
```

**Валидация:**

```bash
npm run lint
npm run build
```

**Manual Check:** finish a workout and edit an existing workout.

**Stop Condition:** `workoutService.ts` no longer uses broad `any`.

## Step 07 - Type PWA Install Hook

**Цел:** премахни `any` от PWA install flow.

**Файлове:**

- `src/hooks/usePWAInstall.ts`

**Prompt:**

```text
Type the PWA beforeinstallprompt flow without using any.

Tasks:
1. Define a local BeforeInstallPromptEvent interface with preventDefault(),
   prompt(), and userChoice.
2. Type installPrompt state with that interface or null.
3. Type the beforeinstallprompt event handler safely.
4. Remove debug console.log calls or gate them behind development-only checks.
5. Preserve existing install prompt behavior.
```

**Валидация:**

```bash
npm run lint
```

**Stop Condition:** `usePWAInstall.ts` has no `any` and no production debug logs.

## Step 08 - Clean Small Unsafe Casts

**Цел:** изчисти remaining малки `any`/unsafe casts без голям refactor.

**Файлове:**

- `src/features/workout/hooks/useWorkoutFlow.ts`
- `src/features/progress/components/ExerciseProgressSelector.tsx`
- `src/components/ui/SaveTemplateModal.tsx`
- `src/pages/AdminPage.tsx`
- `src/pages/NewWorkout.tsx`
- `src/utils/audioUtils.ts`

**Prompt:**

```text
Clean small remaining any usages and unsafe casts in focused UI/helper files.

Tasks:
1. Type finishedWorkout in useWorkoutFlow instead of useState<any>.
2. In ExerciseProgressSelector, replace opt.id as any with a typed sort option
   array.
3. Replace catch (err: any) with unknown plus a small getErrorMessage helper.
4. In NewWorkout, avoid behavior: 'instant' as any if possible; use a typed
   supported behavior or a minimal safe alternative.
5. In audioUtils, type webkitAudioContext access with a local Window extension
   instead of (window as any).

Keep UI behavior unchanged.
```

**Валидация:**

```bash
npm run lint
```

**Stop Condition:** targeted files have no avoidable `any` or `as any`.

## Step 09 - Split Persisted And Draft Types

**Цел:** намали non-null assertions около persisted Firestore documents.

**Файлове:**

- `src/types/index.ts`
- `src/services/exerciseService.ts`
- `src/services/workoutService.ts`
- `src/services/templateService.ts`
- caller files that currently use `ex.id!`

**Prompt:**

```text
Introduce clear persisted versus draft Firestore document types.

Problem:
Exercise.id and Workout.id are optional because create payloads omit them, but
many UI paths assume loaded documents always have IDs.

Tasks:
1. Add explicit persisted types, for example PersistedExercise,
   PersistedWorkout, PersistedWorkoutTemplate, or a generic WithId<T>.
2. Use persisted types for service read results where Firestore doc.id is added.
3. Keep create/update input types separate from persisted read types.
4. Replace the highest-risk non-null assertions in session/template selection
   with typed persisted inputs or guarded early returns.
5. Do not attempt to fix every optional property in the whole app if it makes
   the step too large. Prefer the exercise/template ID path first.
```

**Валидация:**

```bash
npm run lint
npm run build
```

**Manual Check:** add exercise to session, start template, save template from
history.

**Stop Condition:** loaded exercise/template records have typed IDs in the main
selection flows.

## Step 10 - Extract Workout Session Persistence

**Цел:** първа малка стъпка към разделяне на `useWorkoutSession`.

**Файлове:**

- `src/hooks/useWorkoutSession.ts`
- new file under `src/features/workout/hooks/` if useful
- `src/constants/index.ts`

**Prompt:**

```text
Extract only localStorage hydration and persistence from useWorkoutSession.

Tasks:
1. Create a small hook/helper for reading and writing active workout session
   localStorage state.
2. Move localStorage key handling out of useWorkoutSession where possible.
3. Preserve exact existing persistence behavior and STORAGE_KEYS usage.
4. Do not split context or change public useWorkoutContext() API yet.
5. Keep files close to the 200-line project guideline where practical.
```

**Валидация:**

```bash
npm run lint
npm run build
```

**Manual Check:** start session, refresh page, confirm session resumes, clear
session, refresh again.

**Stop Condition:** persistence logic is isolated and public workout context API
is unchanged.

## Step 11 - Extract Workout Session Mutations

**Цел:** отдели add/update/remove set/exercise logic от orchestration.

**Файлове:**

- `src/hooks/useWorkoutSession.ts`
- `src/features/workout/hooks/*`
- `src/types/index.ts`

**Prompt:**

```text
Extract workout session mutation helpers from useWorkoutSession without changing
the public context API.

Tasks:
1. Move addExercise, updateSet, addSet, removeSet, removeExercise,
   markExerciseAsCompleted, removeIncompleteSets, updateExerciseNotes,
   combineExercises, and uncombineSuperset into a focused helper/hook if it
   keeps the code clearer.
2. Preserve rest timer triggering when a LIVE set becomes completed.
3. Preserve manual mode behavior where new sets are completed by default.
4. Preserve superset behavior and insertion order.
5. Do not split React context in this step.
```

**Валидация:**

```bash
npm run lint
npm run build
```

**Manual Check:** add exercises, add/remove sets, complete live set, combine and
uncombine superset.

**Stop Condition:** mutation logic is easier to locate and workout UI behavior
is unchanged.

## Step 12 - Extract Finish Workout Flow

**Цел:** изолирай save/finish orchestration и error recovery.

**Файлове:**

- `src/hooks/useWorkoutSession.ts`
- `src/features/workout/hooks/*`
- `src/services/workoutService.ts`

**Prompt:**

```text
Extract the finishWorkout save orchestration from useWorkoutSession.

Tasks:
1. Move workout payload construction and save orchestration into a focused
   helper/hook.
2. Keep isSaving reset in a finally block.
3. Preserve filtering rules for LIVE completed sets and MANUAL data-containing
   sets.
4. Preserve durationSeconds calculations.
5. Ensure failed saves do not clear the session and do not leave isSaving stuck.
```

**Валидация:**

```bash
npm run lint
npm run build
```

**Manual Check:** finish a valid workout, try a failed save scenario if possible,
and confirm the session remains recoverable.

**Stop Condition:** save orchestration is isolated and failure recovery remains
correct.

## Step 13 - Split Workout Context Read And Actions

**Цел:** намали rerenders от широк context, без breaking migration.

**Файлове:**

- `src/features/workout/context/WorkoutSessionContext.tsx`
- `src/hooks/useWorkoutSession.ts`
- consumers only if needed

**Prompt:**

```text
Split WorkoutSessionContext into smaller contexts while preserving compatibility.

Tasks:
1. Add separate contexts for state and actions, and optionally a small derived
   status context for hasActiveSession/isActiveLive/isActiveManual.
2. Keep useWorkoutContext() as a compatibility wrapper so existing consumers do
   not all need to migrate at once.
3. Add new focused hooks such as useWorkoutSessionState(),
   useWorkoutSessionActions(), or useWorkoutSessionStatus().
4. Migrate only layout-level consumers if this is small and safe.
5. Do not change workout behavior.
```

**Валидация:**

```bash
npm run lint
npm run build
```

**Manual Check:** dashboard active-session state, navbar/bottom nav padding,
live workout flow, manual workout flow.

**Stop Condition:** smaller contexts exist, compatibility remains, and layout can
subscribe to less state where practical.

## Step 14 - Reduce App Data Provider Breadth

**Цел:** намали голямата `AppDataProvider` стойност без duplicate subscriptions.

**Файлове:**

- `src/context/AppDataContext.tsx`
- `src/hooks/useAdmin.ts`
- `src/hooks/useAppSettings.ts`
- `src/hooks/useUserSettings.ts`
- `src/hooks/useExercises.ts`

**Prompt:**

```text
Reduce AppDataProvider context breadth while keeping one shared owner for remote
state.

Important:
Do not reintroduce duplicate Firestore subscriptions in leaf hooks. The current
useAdmin/useAppSettings/useUserSettings/useExercises hooks already wrap
AppDataProvider and should stay thin.

Tasks:
1. Memoize provider values and callback groups where useful.
2. Consider splitting state/actions or settings/exercises/admin contexts only if
   it keeps the code clear and compatible.
3. Preserve the existing public hook APIs.
4. Do not change Firestore paths or business behavior.
```

**Валидация:**

```bash
npm run lint
npm run build
```

**Manual Check:** login, app public/private gate, admin route, settings changes,
exercise list load.

**Stop Condition:** provider values are more stable, with no duplicate remote
listeners added.

## Step 15 - Add Minimal Test Harness

**Цел:** добави тестова основа без да тестваш целия проект наведнъж.

**Файлове:**

- `package.json`
- `vite.config.ts` or test config file if needed
- new test setup file if needed

**Prompt:**

```text
Add a minimal automated test harness for this Vite React TypeScript project.

Preferred tools:
- Vitest
- React Testing Library only if component/hook tests need it

Tasks:
1. Add dev dependencies and package scripts for tests.
2. Add minimal config/setup only if required.
3. Add one tiny smoke test for a pure helper or a simple hook-safe utility.
4. Do not attempt broad test coverage in this step.
```

**Валидация:**

```bash
npm run lint
npm run build
npm test
```

**Stop Condition:** `npm test` exists and runs at least one passing test.

## Step 16 - Add Rules And Payload Tests

**Цел:** покрий най-рисковите Firestore payload/rules helper случаи.

**Файлове:**

- test files near services/rules helpers
- `package.json`
- Firebase emulator config only if chosen

**Prompt:**

```text
Add focused tests for settings and Firestore payload behavior.

Tasks:
1. Test user settings payload/rules assumptions: partial updates for fontSize,
   language, notificationSound, and isNotificationsEnabled.
2. Test exercise payload normalization for admin/global and user/custom paths.
3. Test cleanUndefined/serialization behavior in workoutService if it was
   extracted into a testable helper.
4. If Firebase emulator tests are practical in this environment, add rules tests
   for settings/exercises/workouts/templates. If not, add a documented manual
   emulator checklist instead.
```

**Валидация:**

```bash
npm run lint
npm test
```

**Stop Condition:** high-risk payload behavior has tests or a clear manual rules
checklist.

## Step 17 - Add Workout Session Regression Tests

**Цел:** покрий state transitions след refactor-а на session logic.

**Файлове:**

- `src/hooks/useWorkoutSession.ts`
- `src/features/workout/hooks/*`
- related test files

**Prompt:**

```text
Add focused regression tests for workout session behavior.

Tasks:
1. Test LIVE mode add exercise and set completion behavior.
2. Test MANUAL mode new sets are completed by default.
3. Test finishWorkout filters empty/incomplete sets correctly.
4. Test failed save keeps session data and resets isSaving.
5. Test localStorage hydration/resume behavior if the persistence helper is
   testable.
6. Keep tests focused; do not snapshot broad UI.
```

**Валидация:**

```bash
npm run lint
npm test
```

**Stop Condition:** key session state transitions are covered.

## Step 18 - Enable Strict TypeScript

**Цел:** включи `strict` след предварителния cleanup.

**Файлове:**

- `tsconfig.json`
- files reported by TypeScript

**Prompt:**

```text
Enable TypeScript strict mode gradually.

Tasks:
1. Add "strict": true to tsconfig.json.
2. Run npm run lint.
3. Fix the resulting TypeScript errors in small, local changes.
4. Do not enable noUncheckedIndexedAccess yet unless the error count is small
   and the fixes are straightforward.
5. Do not use any to silence strict-mode errors unless there is no safer local
   alternative.
```

**Валидация:**

```bash
npm run lint
npm run build
npm test
```

**Stop Condition:** strict mode is enabled and validation passes.

## Step 19 - Improve Firestore Error Handling

**Цел:** подобри error model без да губиш diagnostics.

**Файлове:**

- `src/services/firebase.ts`
- service files that call `handleFirestoreError`
- UI files only if needed for user-facing errors

**Prompt:**

```text
Improve Firestore error handling while preserving diagnostics.

Problem:
handleFirestoreError logs structured JSON and throws Error(JSON.stringify(...)),
which makes user-facing messages and stack traces harder to work with.

Tasks:
1. Introduce a small FirestoreAppError class or equivalent structured Error.
2. Preserve operationType, path, auth diagnostics, and original message.
3. Keep detailed diagnostics in console.error.
4. Throw an Error with a readable message and structured metadata.
5. Update callers only if required by the new error shape.
```

**Валидация:**

```bash
npm run lint
npm run build
npm test
```

**Manual Check:** trigger or simulate a Firestore failure and confirm the UI/logs
remain understandable.

**Stop Condition:** errors preserve diagnostics without JSON-string-only messages.

## Step 20 - Clean Debug Logging

**Цел:** махни production debug logs.

**Файлове:**

- `src/components/layout/UserMenu.tsx`
- `src/hooks/usePWAInstall.ts`
- any other files found by searching `console.log`

**Prompt:**

```text
Remove or gate production debug console.log calls.

Tasks:
1. Search src for console.log.
2. Remove logs that are pure debugging.
3. If a log is useful only during development, guard it behind
   import.meta.env.DEV.
4. Leave console.warn/error only where they represent real recoverable or
   diagnostic errors.
```

**Валидация:**

```bash
npm run lint
```

**Stop Condition:** no unguarded debug `console.log` remains in production code.

## Step 21 - Update Technical Debt Document

**Цел:** направи debt документа вярен спрямо текущия код.

**Файлове:**

- `TECHNICAL_DEBT.md`

**Prompt:**

```text
Rewrite TECHNICAL_DEBT.md so it reflects the current codebase.

Required updates:
1. Mark exercise rule-safe reads as closed/verified if they are still implemented
   as separate global and user-custom queries.
2. Mark reactive exercise history as closed/verified if useExerciseHistory still
   derives from WorkoutHistoryProvider.
3. Keep broad WorkoutSessionContext, AppDataProvider breadth, strict TypeScript,
   testing gaps, and documentation drift as open items if still true.
4. Remove claims that contradict existing files, such as missing bottom nav if
   BottomNav.tsx exists.
5. Keep the document concise and actionable.
```

**Валидация:**

```bash
npx -y markdownlint-cli TECHNICAL_DEBT.md
```

**Stop Condition:** `TECHNICAL_DEBT.md` is accurate and lint-clean or has only
accepted baseline markdown issues.

## Step 22 - Update Architecture Document

**Цел:** синхронизирай architecture docs с реалната имплементация.

**Файлове:**

- `ARCHITECTURE.md`

**Prompt:**

```text
Update ARCHITECTURE.md to match the current implementation.

Include:
1. Actual provider hierarchy and ownership.
2. AppDataProvider responsibilities and thin wrapper hooks.
3. Current user settings fields.
4. Current admin authorization model after the admin source-of-truth decision.
5. Current exercise loading strategy: separate global and user-custom queries.
6. Current workout live/manual session behavior.
7. Current template and custom exercise behavior.

Do not invent features that are not in code.
```

**Валидация:**

```bash
npx -y markdownlint-cli ARCHITECTURE.md
```

**Stop Condition:** architecture doc matches code and rule decisions.

## Step 23 - Update PRD

**Цел:** направи PRD полезен за текущия продукт.

**Файлове:**

- `PRD.md`

**Prompt:**

```text
Update PRD.md for the current FitTrace behavior.

Include:
1. Current target users and roles.
2. Google auth and admin access.
3. Live versus manual workout flow.
4. One-set prefill behavior based on previous exercise history.
5. Custom exercises and admin/global exercises.
6. Templates.
7. Progress/history behavior.
8. User settings: language, font size, notification sound, notifications enabled.
9. Public/private app mode.

Remove stale phase tracking or old behavior that no longer matches code.
```

**Валидация:**

```bash
npx -y markdownlint-cli PRD.md
```

**Stop Condition:** PRD describes the current app, not an older plan.

## Step 24 - Update Firebase And Security Docs

**Цел:** синхронизирай docs с актуалните Firestore rules.

**Файлове:**

- `FIREBASE_GUIDE.md`
- `security_spec.md`
- `firestore.rules`

**Prompt:**

```text
Update Firebase and security documentation after the rules changes.

Tasks:
1. Document current collections: admins, settings/global,
   users/{userId}/settings/display, exercises, workouts, workout_templates.
2. Document the admin source of truth.
3. Document global versus custom exercise access.
4. Document user settings fields and allowed values.
5. Document workout and template invariants that rules enforce.
6. Remove hardcoded personal setup details unless they are explicitly needed.
7. Remove references to nonexistent automated rules tests unless those tests were
   added. If only a manual checklist exists, say so clearly.
```

**Валидация:**

```bash
npx -y markdownlint-cli FIREBASE_GUIDE.md security_spec.md
```

**Stop Condition:** Firebase/security docs match `firestore.rules`.

## Step 25 - Final Validation And Plan Cleanup

**Цел:** провери цялостното състояние и обнови execution docs.

**Файлове:**

- `validation_baseline.md`
- `AI_EXECUTION_PROMPTS.md`
- any docs changed during the plan

**Prompt:**

```text
Run final validation and update the project plan status.

Run:
1. npm run lint
2. npm run build
3. npm test, if a test script exists
4. npx -y markdownlint-cli ./*.md

Tasks:
1. Update validation_baseline.md with final pass/fail status.
2. In AI_EXECUTION_PROMPTS.md, add a short status note for completed steps if
   this file is being used as the active execution tracker.
3. Do not make unrelated code changes during final validation.
```

**Stop Condition:** final validation results are recorded and remaining known
issues are explicit.

## Recommended Execution Order

1. Steps 01-04: correctness and security rules.
2. Steps 05-09: TypeScript cleanup and document types.
3. Steps 10-14: session/app context refactor.
4. Steps 15-17: tests.
5. Steps 18-20: strict TypeScript and error/log cleanup.
6. Steps 21-25: documentation and final validation.

## Notes For The Online AI Agent

- Prefer small patches and validate after each patch.
- If a step becomes too large, split it into two substeps and stop after the
  first validated substep.
- Do not re-open old findings without checking current code first.
- Keep the public API stable unless the prompt explicitly asks to migrate it.
- When uncertain between a rule change and an app payload change, prefer the
  stricter rule and adjust the payload narrowly.
