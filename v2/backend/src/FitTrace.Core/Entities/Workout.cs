namespace FitTrace.Core.Entities;

public class Workout
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User? User { get; set; }

    public DateTime Date { get; set; } = DateTime.UtcNow;
    public DateTime? StartedAt { get; set; }
    public int? DurationSeconds { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<WorkoutExercise> Exercises { get; set; } = new List<WorkoutExercise>();
}
