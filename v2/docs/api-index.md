# Индекс на API Ендпоинтите (FitTrace v2)

Този индекс служи като бърза навигационна карта към бекенд ендпоинтите. За конкретните входни/изходни DTO модели и логика, следвайте съответните линкове към сорс кода.

---

## 1. Тренировки (Workouts)
Управление на тренировъчни сесии, упражнения и серии в рамките на тренировката.

| Метод & Маршрут | Предназначение | Сорс файл (Контролер / Action) |
| :--- | :--- | :--- |
| `GET /api/workouts` | Извличане на списък с тренировки на потребителя (с филтриране по период). | [`WorkoutsController.cs`](../backend/src/FitTrace.Api/Controllers/WorkoutsController.cs) |
| `GET /api/workouts/{id}` | Детайли за конкретна тренировка, включително упражнения, суперсерии и серии. | [`WorkoutsController.cs`](../backend/src/FitTrace.Api/Controllers/WorkoutsController.cs) |
| `POST /api/workouts` | Запис на приключена тренировъчна сесия с автоматично нормализиране на сериите. | [`WorkoutsController.cs`](../backend/src/FitTrace.Api/Controllers/WorkoutsController.cs) |
| `PUT /api/workouts/{id}` | Редакция на вече съхранена тренировка (корекция на тежести, бележки, серии). | [`WorkoutsController.cs`](../backend/src/FitTrace.Api/Controllers/WorkoutsController.cs) |
| `DELETE /api/workouts/{id}` | Изтриване на тренировка и каскадно премахване на свързаните серийни данни. | [`WorkoutsController.cs`](../backend/src/FitTrace.Api/Controllers/WorkoutsController.cs) |

- **DTO модели:** [`CreateWorkoutDto.cs`](../backend/src/FitTrace.Core/DTOs/WorkoutDtos.cs), [`WorkoutResponseDto.cs`](../backend/src/FitTrace.Core/DTOs/WorkoutDtos.cs)
- **Бизнес услуга:** [`IWorkoutService.cs`](../backend/src/FitTrace.Core/Services/IWorkoutService.cs)

---

## 2. Упражнения (Exercises)
Каталог на глобалните (системни) и потребителски персонализирани упражнения.

| Метод & Маршрут | Предназначение | Сорс файл (Контролер / Action) |
| :--- | :--- | :--- |
| `GET /api/exercises` | Извличане на упражненията (глобални + тези на текущия потребител). | [`ExercisesController.cs`](../backend/src/FitTrace.Api/Controllers/ExercisesController.cs) |
| `GET /api/exercises/{id}` | Извличане на конкретно упражнение по ID. | [`ExercisesController.cs`](../backend/src/FitTrace.Api/Controllers/ExercisesController.cs) |
| `POST /api/exercises` | Създаване на ново персонализирано упражнение от потребителя. | [`ExercisesController.cs`](../backend/src/FitTrace.Api/Controllers/ExercisesController.cs) |
| `PUT /api/exercises/{id}` | Редакция на персонализирано упражнение (ако принадлежи на потребителя). | [`ExercisesController.cs`](../backend/src/FitTrace.Api/Controllers/ExercisesController.cs) |
| `DELETE /api/exercises/{id}` | Изтриване на персонализирано упражнение. | [`ExercisesController.cs`](../backend/src/FitTrace.Api/Controllers/ExercisesController.cs) |

- **DTO модели:** [`ExerciseDtos.cs`](../backend/src/FitTrace.Core/DTOs/ExerciseDtos.cs)
- **Бизнес услуга:** [`IExerciseService.cs`](../backend/src/FitTrace.Core/Services/IExerciseService.cs)

---

## 3. Аналитика и прогрес (Progress & Analytics)
Изчисляване на статистики, максимални тежести (1RM) и тренировъчен обем.

| Метод & Маршрут | Предназначение | Сорс файл (Контролер / Action) |
| :--- | :--- | :--- |
| `GET /api/progress/exercise/{exerciseId}` | Хронология на максимален 1RM и тонаж по сесии за дадено упражнение. | [`ProgressController.cs`](../backend/src/FitTrace.Api/Controllers/ProgressController.cs) |
| `GET /api/progress/summary` | Обобщена статистика (общ тонаж, брой завършени тренировки за период). | [`ProgressController.cs`](../backend/src/FitTrace.Api/Controllers/ProgressController.cs) |

- **Калкулатор формули (1RM Epley/Brzycki):** [`ProgressCalculator.cs`](../backend/src/FitTrace.Core/Services/ProgressCalculator.cs)
- **DTO модели:** [`ProgressDtos.cs`](../backend/src/FitTrace.Core/DTOs/ProgressDtos.cs)
