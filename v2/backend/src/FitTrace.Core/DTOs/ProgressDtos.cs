namespace FitTrace.Core.DTOs;

public record ExerciseProgressPointDto(
    DateTime Date,
    Guid WorkoutId,
    decimal MaxWeight,
    decimal EstimatedOneRepMax,
    decimal SessionVolume,
    int TotalReps
);

public record ExerciseProgressHistoryDto(
    Guid ExerciseId,
    string ExerciseName,
    decimal AllTimeMaxWeight,
    decimal AllTimeEstimatedOneRepMax,
    List<ExerciseProgressPointDto> History
);

public record WorkoutSummaryDto(
    int TotalWorkouts,
    decimal TotalVolume,
    int TotalSetsCompleted,
    int TotalDurationMinutes
);
