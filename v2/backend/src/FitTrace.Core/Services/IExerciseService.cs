using FitTrace.Core.DTOs;

namespace FitTrace.Core.Services;

public interface IExerciseService
{
    Task<List<ExerciseDto>> GetExercisesAsync(Guid userId);
    Task<ExerciseDto?> GetExerciseByIdAsync(Guid exerciseId, Guid userId);
    Task<ExerciseDto> CreateCustomExerciseAsync(Guid userId, CreateExerciseDto dto);
    Task<bool> DeleteCustomExerciseAsync(Guid exerciseId, Guid userId);
}
