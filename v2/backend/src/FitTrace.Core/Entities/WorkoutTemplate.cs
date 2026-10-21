namespace FitTrace.Core.Entities;

public class WorkoutTemplate
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User? User { get; set; }

    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<TemplateExercise> TemplateExercises { get; set; } = new List<TemplateExercise>();
}

public class TemplateExercise
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TemplateId { get; set; }
    public WorkoutTemplate? Template { get; set; }

    public Guid ExerciseId { get; set; }
    public Exercise? Exercise { get; set; }
    public int OrderIndex { get; set; }
}
