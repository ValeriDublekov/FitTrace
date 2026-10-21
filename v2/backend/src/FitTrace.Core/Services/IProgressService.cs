using FitTrace.Core.DTOs;

namespace FitTrace.Core.Services;

public interface IProgressService
{
    Task<ExerciseProgressHistoryDto?> GetExerciseProgressHistoryAsync(Guid exerciseId, Guid userId);
    Task<WorkoutSummaryDto> GetUserSummaryAsync(Guid userId);
}
