using FitTrace.Core.DTOs;
using FitTrace.Core.Services;
using Microsoft.EntityFrameworkCore;

namespace FitTrace.Data.Services;

public class ProgressService : IProgressService
{
    private readonly AppDbContext _context;

    public ProgressService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ExerciseProgressHistoryDto?> GetExerciseProgressHistoryAsync(Guid exerciseId, Guid userId)
    {
        var exercise = await _context.Exercises
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == exerciseId && (!e.IsCustom || e.UserId == userId));

        if (exercise == null)
        {
            return null;
        }

        var sessions = await _context.WorkoutExercises
            .AsNoTracking()
            .Where(we => we.ExerciseId == exerciseId && we.Workout!.UserId == userId)
            .OrderBy(we => we.Workout!.Date)
            .Select(we => new
            {
                WorkoutId = we.WorkoutId,
                Date = we.Workout!.Date,
                Sets = we.Sets.Where(s => s.IsCompleted).Select(s => new { s.Weight, s.Reps }).ToList()
            })
            .ToListAsync();

        var historyPoints = new List<ExerciseProgressPointDto>();
        decimal allTimeMaxWeight = 0;
        decimal allTimeEstimated1RM = 0;

        foreach (var session in sessions)
        {
            if (session.Sets.Count == 0) continue;

            decimal sessionMaxWeight = 0;
            decimal sessionMax1RM = 0;
            decimal sessionVolume = 0;
            int totalReps = 0;

            foreach (var set in session.Sets)
            {
                decimal weight = set.Weight ?? 0;
                int reps = set.Reps ?? 0;

                if (weight > sessionMaxWeight)
                {
                    sessionMaxWeight = weight;
                }

                decimal oneRepMax = ProgressCalculator.CalculateEpleyOneRepMax(weight, reps);
                if (oneRepMax > sessionMax1RM)
                {
                    sessionMax1RM = oneRepMax;
                }

                sessionVolume += ProgressCalculator.CalculateSetVolume(weight, reps);
                totalReps += reps;
            }

            if (sessionMaxWeight > allTimeMaxWeight)
            {
                allTimeMaxWeight = sessionMaxWeight;
            }

            if (sessionMax1RM > allTimeEstimated1RM)
            {
                allTimeEstimated1RM = sessionMax1RM;
            }

            historyPoints.Add(new ExerciseProgressPointDto(
                session.Date,
                session.WorkoutId,
                sessionMaxWeight,
                sessionMax1RM,
                sessionVolume,
                totalReps
            ));
        }

        return new ExerciseProgressHistoryDto(
            exercise.Id,
            exercise.Name,
            allTimeMaxWeight,
            allTimeEstimated1RM,
            historyPoints
        );
    }

    public async Task<WorkoutSummaryDto> GetUserSummaryAsync(Guid userId)
    {
        var workouts = await _context.Workouts
            .AsNoTracking()
            .Where(w => w.UserId == userId)
            .Include(w => w.Exercises)
                .ThenInclude(we => we.Sets)
            .ToListAsync();

        int totalWorkouts = workouts.Count;
        decimal totalVolume = 0;
        int totalSetsCompleted = 0;
        int totalDurationSeconds = 0;

        foreach (var workout in workouts)
        {
            totalDurationSeconds += workout.DurationSeconds ?? 0;
            foreach (var we in workout.Exercises)
            {
                foreach (var set in we.Sets)
                {
                    if (set.IsCompleted)
                    {
                        totalSetsCompleted++;
                        totalVolume += ProgressCalculator.CalculateSetVolume(set.Weight, set.Reps);
                    }
                }
            }
        }

        return new WorkoutSummaryDto(
            totalWorkouts,
            Math.Round(totalVolume, 2),
            totalSetsCompleted,
            totalDurationSeconds / 60
        );
    }
}
