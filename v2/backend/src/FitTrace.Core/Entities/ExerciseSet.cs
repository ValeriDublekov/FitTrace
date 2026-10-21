namespace FitTrace.Core.Entities;

public class ExerciseSet
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid WorkoutExerciseId { get; set; }
    public WorkoutExercise? WorkoutExercise { get; set; }

    public int SetIndex { get; set; }
    public decimal? Weight { get; set; }
    public int? Reps { get; set; }
    public int? Level { get; set; }
    public int? DurationSeconds { get; set; }
    public bool IsCompleted { get; set; } = true;
}
