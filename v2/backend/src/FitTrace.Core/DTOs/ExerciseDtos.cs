using FitTrace.Core.Enums;

namespace FitTrace.Core.DTOs;

public record ExerciseDto(
    Guid Id,
    string Name,
    string Category,
    LoadType LoadType,
    string? AffectedPart,
    string? ThumbnailUrl,
    string? DefaultNotes,
    string? Description,
    string? Url,
    bool IsCustom,
    Guid? UserId
);

public record CreateExerciseDto(
    string Name,
    string Category,
    LoadType LoadType,
    string? AffectedPart,
    string? ThumbnailUrl,
    string? DefaultNotes,
    string? Description,
    string? Url
);

public record UpdateExerciseDto(
    string Name,
    string Category,
    LoadType LoadType,
    string? AffectedPart,
    string? ThumbnailUrl,
    string? DefaultNotes,
    string? Description,
    string? Url
);
