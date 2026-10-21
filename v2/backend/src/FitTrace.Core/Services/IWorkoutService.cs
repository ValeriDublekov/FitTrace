using FitTrace.Core.DTOs;

namespace FitTrace.Core.Services;

public interface IWorkoutService
{
    Task<List<WorkoutResponseDto>> GetUserWorkoutsAsync(Guid userId, DateTime? fromDate = null, DateTime? toDate = null);
    Task<WorkoutResponseDto?> GetWorkoutByIdAsync(Guid workoutId, Guid userId);
    Task<WorkoutResponseDto> CreateWorkoutAsync(Guid userId, CreateWorkoutDto dto);
    Task<bool> DeleteWorkoutAsync(Guid workoutId, Guid userId);
}
