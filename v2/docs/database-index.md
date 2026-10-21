# Индекс на Релационната База Данни (PostgreSQL 16)

Този документ описва архитектурата на базата данни на концептуално ниво (таблици, предназначение и релации между тях). За детайлните типове колони, индекси и валидации, последвайте препратките към Entity моделите и EF Core Fluent API конфигурациите.

---

## Релационна диаграма (ER Overview)

```text
 Users (1) ───────────────< Workouts (*) ───────────────< WorkoutExercises (*) ───────────────< ExerciseSets (*)
   │                                                              │
   │                                                              │ (N:1)
   └──────────────────────< Exercises (*) ────────────────────────┘
```

---

## Таблици

### 1. `users`
- **Предназначение:** Потребители на системата, роли (Admin/User) и метаданни.
- **Връзки:**
  - 1-към-много с `workouts` (FK: `workouts.user_id -> users.id`, Cascade Delete).
  - 1-към-много с `exercises` (за персонализирани упражнения на потребителя).
- **Сорс дефиниция (Полета):** [`User.cs`](../backend/src/FitTrace.Core/Entities/User.cs)
- **EF Конфигурация:** [`UserConfiguration.cs`](../backend/src/FitTrace.Data/Configurations/UserConfiguration.cs)

---

### 2. `exercises`
- **Предназначение:** Каталог от упражнения (системни глобални и лични потребителски), техните категории, типове натоварване (`WEIGHT_REPS`, `LEVEL_REPS`, `CARDIO`) и мускулни групи.
- **Връзки:**
  - Много-към-1 с `users` (незадължителен FK: `exercises.user_id -> users.id`; NULL означава глобално упражнение).
  - 1-към-много с `workout_exercises`.
- **Сорс дефиниция (Полета):** [`Exercise.cs`](../backend/src/FitTrace.Core/Entities/Exercise.cs)
- **EF Конфигурация:** [`ExerciseConfiguration.cs`](../backend/src/FitTrace.Data/Configurations/ExerciseConfiguration.cs)

---

### 3. `workouts`
- **Предназначение:** Завършени или активни тренировъчни сесии, време на старт, времетраене и общи бележки.
- **Връзки:**
  - Много-към-1 с `users` (FK: `workouts.user_id -> users.id`).
  - 1-към-много с `workout_exercises` (Cascade Delete).
- **Сорс дефиниция (Полета):** [`Workout.cs`](../backend/src/FitTrace.Core/Entities/Workout.cs)
- **EF Конфигурация:** [`WorkoutConfiguration.cs`](../backend/src/FitTrace.Data/Configurations/WorkoutConfiguration.cs)

---

### 4. `workout_exercises`
- **Предназначение:** Мост между конкретна тренировка и упражненията, изпълнени в нея. Съхранява подредба (`order_index`), локални бележки за сесията и групов идентификатор за суперсерии (`superset_group_id`).
- **Връзки:**
  - Много-към-1 с `workouts` (FK: `workout_exercises.workout_id -> workouts.id`, Cascade Delete).
  - Много-към-1 с `exercises` (FK: `workout_exercises.exercise_id -> exercises.id`, Restrict Delete).
  - 1-към-много с `exercise_sets` (Cascade Delete).
- **Сорс дефиниция (Полета):** [`WorkoutExercise.cs`](../backend/src/FitTrace.Core/Entities/WorkoutExercise.cs)
- **EF Конфигурация:** [`WorkoutExerciseConfiguration.cs`](../backend/src/FitTrace.Data/Configurations/WorkoutExerciseConfiguration.cs)

---

### 5. `exercise_sets`
- **Предназначение:** Индивидуални серии в рамките на упражнение (номер на серия, килограми, повторения, ниво, продължителност, статус на завършеност).
- **Връзки:**
  - Много-към-1 с `workout_exercises` (FK: `exercise_sets.workout_exercise_id -> workout_exercises.id`, Cascade Delete).
- **Сорс дефиниция (Полета):** [`ExerciseSet.cs`](../backend/src/FitTrace.Core/Entities/ExerciseSet.cs)
- **EF Конфигурация:** [`ExerciseSetConfiguration.cs`](../backend/src/FitTrace.Data/Configurations/ExerciseSetConfiguration.cs)

---

### 6. `workout_templates`
- **Предназначение:** Предварително дефинирани тренировъчни програми/шаблони за бързо стартиране.
- **Връзки:**
  - Много-към-1 с `users`.
  - 1-към-много с `template_exercises`.
- **Сорс дефиниция (Полета):** [`WorkoutTemplate.cs`](../backend/src/FitTrace.Core/Entities/WorkoutTemplate.cs)
- **EF Конфигурация:** [`WorkoutTemplateConfiguration.cs`](../backend/src/FitTrace.Data/Configurations/WorkoutTemplateConfiguration.cs)
