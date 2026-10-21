using FitTrace.Core.DTOs;
using FitTrace.Core.Entities;

namespace FitTrace.Core.Services;

/// <summary>
/// Домейн калкулатор за силови тренировки, 1RM (one-rep max) и тренировъчен обем (tonnage).
/// Следва принципите KISS и DRY.
/// </summary>
public static class ProgressCalculator
{
    /// <summary>
    /// Изчислява прогнозен 1RM по популярната формула на Epley:
    /// 1RM = Weight * (1 + Reps / 30)
    /// За 1 повторение формулата връща точно тежестта.
    /// </summary>
    public static decimal CalculateEpleyOneRepMax(decimal weight, int reps)
    {
        if (weight <= 0 || reps <= 0)
        {
            return 0;
        }

        if (reps == 1)
        {
            return Math.Round(weight, 2);
        }

        decimal oneRepMax = weight * (1m + (decimal)reps / 30m);
        return Math.Round(oneRepMax, 2);
    }

    /// <summary>
    /// Изчислява прогнозен 1RM по формулата на Brzycki:
    /// 1RM = Weight / (1.0278 - 0.0278 * Reps)
    /// </summary>
    public static decimal CalculateBrzyckiOneRepMax(decimal weight, int reps)
    {
        if (weight <= 0 || reps <= 0)
        {
            return 0;
        }

        if (reps >= 36) // Формулата е валидна до ~36 повторения
        {
            return Math.Round(weight * 2m, 2);
        }

        decimal denominator = 1.0278m - (0.0278m * reps);
        if (denominator <= 0)
        {
            return Math.Round(weight, 2);
        }

        decimal oneRepMax = weight / denominator;
        return Math.Round(oneRepMax, 2);
    }

    /// <summary>
    /// Изчислява тренировъчния обем (тонаж) на дадена серия: Weight * Reps.
    /// </summary>
    public static decimal CalculateSetVolume(decimal? weight, int? reps)
    {
        if (!weight.HasValue || !reps.HasValue || weight.Value <= 0 || reps.Value <= 0)
        {
            return 0;
        }

        return Math.Round(weight.Value * reps.Value, 2);
    }

    /// <summary>
    /// Изчислява общия обем на тренировъчна сесия.
    /// </summary>
    public static decimal CalculateWorkoutTotalVolume(IEnumerable<WorkoutExercise> exercises)
    {
        decimal total = 0;
        foreach (var exercise in exercises)
        {
            foreach (var set in exercise.Sets)
            {
                if (set.IsCompleted)
                {
                    total += CalculateSetVolume(set.Weight, set.Reps);
                }
            }
        }
        return Math.Round(total, 2);
    }

    /// <summary>
    /// Нормализира номерацията на сериите да бъде последователна (1-индексирана).
    /// </summary>
    public static List<ExerciseSetDto> NormalizeSets(IEnumerable<ExerciseSetDto> sets)
    {
        return sets
            .Select((set, index) => set with { SetIndex = index + 1 })
            .ToList();
    }
}
