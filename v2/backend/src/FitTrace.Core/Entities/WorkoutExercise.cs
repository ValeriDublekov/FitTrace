namespace FitTrace.Core.Entities;

public class WorkoutExercise
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid WorkoutId { get; set; }
    public Workout? Workout { get; set; }

    public Guid ExerciseId { get; set; }
    public Exercise? Exercise { get; set; }

    public int OrderIndex { get; set; }
    public string? SessionNotes { get; set; }
    public Guid? SupersetGroupId { get; set; }

    public ICollection<ExerciseSet> Sets { get; set; } = new List<ExerciseSet>();
}
