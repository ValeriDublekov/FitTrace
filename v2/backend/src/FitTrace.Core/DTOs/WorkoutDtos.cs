namespace FitTrace.Core.DTOs;

public record ExerciseSetDto(
    int SetIndex,
    decimal? Weight,
    int? Reps,
    int? Level,
    int? DurationSeconds,
    bool IsCompleted
);

public record WorkoutExerciseDto(
    Guid ExerciseId,
    string? ExerciseName,
    int OrderIndex,
    string? SessionNotes,
    Guid? SupersetGroupId,
    List<ExerciseSetDto> Sets
);

public record CreateWorkoutDto(
    DateTime Date,
    DateTime? StartedAt,
    int? DurationSeconds,
    string? Notes,
    List<WorkoutExerciseDto> Exercises
);

public record WorkoutResponseDto(
    Guid Id,
    Guid UserId,
    DateTime Date,
    DateTime? StartedAt,
    int? DurationSeconds,
    string? Notes,
    decimal TotalVolume,
    List<WorkoutExerciseDto> Exercises
);
