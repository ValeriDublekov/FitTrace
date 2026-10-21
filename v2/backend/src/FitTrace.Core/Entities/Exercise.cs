using FitTrace.Core.Enums;

namespace FitTrace.Core.Entities;

public class Exercise
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public LoadType LoadType { get; set; } = LoadType.WEIGHT_REPS;
    public string? AffectedPart { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? DefaultNotes { get; set; }
    public string? Description { get; set; }
    public string? Url { get; set; }

    public bool IsCustom { get; set; } = false;
    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<WorkoutExercise> WorkoutExercises { get; set; } = new List<WorkoutExercise>();
}
