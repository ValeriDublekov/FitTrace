namespace FitTrace.Core.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "User"; // Admin, User
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Workout> Workouts { get; set; } = new List<Workout>();
    public ICollection<Exercise> CustomExercises { get; set; } = new List<Exercise>();
    public ICollection<WorkoutTemplate> Templates { get; set; } = new List<WorkoutTemplate>();
}
