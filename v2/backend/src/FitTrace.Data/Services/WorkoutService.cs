using FitTrace.Core.DTOs;
using FitTrace.Core.Entities;
using FitTrace.Core.Services;
using Microsoft.EntityFrameworkCore;

namespace FitTrace.Data.Services;

public class WorkoutService : IWorkoutService
{
    private readonly AppDbContext _context;

    public WorkoutService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<WorkoutResponseDto>> GetUserWorkoutsAsync(Guid userId, DateTime? fromDate = null, DateTime? toDate = null)
    {
        var query = _context.Workouts
            .AsNoTracking()
            .Where(w => w.UserId == userId);

        if (fromDate.HasValue)
        {
            query = query.Where(w => w.Date >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(w => w.Date <= toDate.Value);
        }

        var workouts = await query
            .OrderByDescending(w => w.Date)
            .Include(w => w.Exercises)
                .ThenInclude(we => we.Exercise)
            .Include(w => w.Exercises)
                .ThenInclude(we => we.Sets.OrderBy(s => s.SetIndex))
            .ToListAsync();

        return workouts.Select(MapToResponseDto).ToList();
    }

    public async Task<WorkoutResponseDto?> GetWorkoutByIdAsync(Guid workoutId, Guid userId)
    {
        var workout = await _context.Workouts
            .AsNoTracking()
            .Where(w => w.Id == workoutId && w.UserId == userId)
            .Include(w => w.Exercises)
                .ThenInclude(we => we.Exercise)
            .Include(w => w.Exercises)
                .ThenInclude(we => we.Sets.OrderBy(s => s.SetIndex))
            .FirstOrDefaultAsync();

        return workout != null ? MapToResponseDto(workout) : null;
    }

    public async Task<WorkoutResponseDto> CreateWorkoutAsync(Guid userId, CreateWorkoutDto dto)
    {
        var workout = new Workout
        {
            UserId = userId,
            Date = dto.Date,
            StartedAt = dto.StartedAt,
            DurationSeconds = dto.DurationSeconds,
            Notes = dto.Notes
        };

        int exerciseOrder = 1;
        foreach (var exerciseDto in dto.Exercises)
        {
            var workoutExercise = new WorkoutExercise
            {
                ExerciseId = exerciseDto.ExerciseId,
                OrderIndex = exerciseOrder++,
                SessionNotes = exerciseDto.SessionNotes,
                SupersetGroupId = exerciseDto.SupersetGroupId
            };

            var normalizedSets = ProgressCalculator.NormalizeSets(exerciseDto.Sets);
            foreach (var setDto in normalizedSets)
            {
                workoutExercise.Sets.Add(new ExerciseSet
                {
                    SetIndex = setDto.SetIndex,
                    Weight = setDto.Weight,
                    Reps = setDto.Reps,
                    Level = setDto.Level,
                    DurationSeconds = setDto.DurationSeconds,
                    IsCompleted = setDto.IsCompleted
                });
            }

            workout.Exercises.Add(workoutExercise);
        }

        _context.Workouts.Add(workout);
        await _context.SaveChangesAsync();

        return await GetWorkoutByIdAsync(workout.Id, userId) 
               ?? throw new InvalidOperationException("Failed to retrieve created workout.");
    }

    public async Task<bool> DeleteWorkoutAsync(Guid workoutId, Guid userId)
    {
        var workout = await _context.Workouts
            .FirstOrDefaultAsync(w => w.Id == workoutId && w.UserId == userId);

        if (workout == null)
        {
            return false;
        }

        _context.Workouts.Remove(workout);
        await _context.SaveChangesAsync();
        return true;
    }

    private static WorkoutResponseDto MapToResponseDto(Workout workout)
    {
        var exerciseDtos = workout.Exercises
            .OrderBy(we => we.OrderIndex)
            .Select(we => new WorkoutExerciseDto(
                we.ExerciseId,
                we.Exercise?.Name,
                we.OrderIndex,
                we.SessionNotes,
                we.SupersetGroupId,
                we.Sets.OrderBy(s => s.SetIndex).Select(s => new ExerciseSetDto(
                    s.SetIndex,
                    s.Weight,
                    s.Reps,
                    s.Level,
                    s.DurationSeconds,
                    s.IsCompleted
                )).ToList()
            )).ToList();

        decimal totalVolume = ProgressCalculator.CalculateWorkoutTotalVolume(workout.Exercises);

        return new WorkoutResponseDto(
            workout.Id,
            workout.UserId,
            workout.Date,
            workout.StartedAt,
            workout.DurationSeconds,
            workout.Notes,
            totalVolume,
            exerciseDtos
        );
    }
}
