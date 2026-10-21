using FitTrace.Core.DTOs;
using FitTrace.Core.Entities;
using FitTrace.Core.Enums;
using FitTrace.Data;
using FitTrace.Data.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace FitTrace.Tests;

public class WorkoutServiceTests
{
    private static AppDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task CreateWorkoutAsync_CreatesWorkoutWithNormalizedSetsAndCalculatesVolume()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var workoutService = new WorkoutService(context);
        var userId = Guid.NewGuid();

        var exercise = new Exercise
        {
            Name = "Bench Press",
            Category = "Chest",
            LoadType = LoadType.WEIGHT_REPS
        };
        context.Exercises.Add(exercise);
        await context.SaveChangesAsync();

        var dto = new CreateWorkoutDto(
            Date: DateTime.UtcNow,
            StartedAt: DateTime.UtcNow.AddMinutes(-45),
            DurationSeconds: 2700,
            Notes: "Chest and Triceps day",
            Exercises: new List<WorkoutExerciseDto>
            {
                new(
                    ExerciseId: exercise.Id,
                    ExerciseName: null,
                    OrderIndex: 1,
                    SessionNotes: "Felt strong",
                    SupersetGroupId: null,
                    Sets: new List<ExerciseSetDto>
                    {
                        new(SetIndex: 10, Weight: 80m, Reps: 10, Level: null, DurationSeconds: null, IsCompleted: true),
                        new(SetIndex: 20, Weight: 90m, Reps: 8, Level: null, DurationSeconds: null, IsCompleted: true)
                    }
                )
            }
        );

        // Act
        var created = await workoutService.CreateWorkoutAsync(userId, dto);

        // Assert
        created.Should().NotBeNull();
        created.UserId.Should().Be(userId);
        created.Notes.Should().Be("Chest and Triceps day");
        created.Exercises.Should().HaveCount(1);

        var firstExercise = created.Exercises[0];
        firstExercise.ExerciseName.Should().Be("Bench Press");
        firstExercise.Sets.Should().HaveCount(2);

        // Verify sets were normalized to 1 and 2
        firstExercise.Sets[0].SetIndex.Should().Be(1);
        firstExercise.Sets[1].SetIndex.Should().Be(2);

        // Total volume = (80 * 10) + (90 * 8) = 800 + 720 = 1520
        created.TotalVolume.Should().Be(1520m);
    }

    [Fact]
    public async Task DeleteWorkoutAsync_RemovesWorkoutSuccessfully()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var workoutService = new WorkoutService(context);
        var userId = Guid.NewGuid();

        var workout = new Workout
        {
            UserId = userId,
            Date = DateTime.UtcNow,
            Notes = "To be deleted"
        };
        context.Workouts.Add(workout);
        await context.SaveChangesAsync();

        // Act
        var deleted = await workoutService.DeleteWorkoutAsync(workout.Id, userId);

        // Assert
        deleted.Should().BeTrue();
        var remaining = await context.Workouts.FirstOrDefaultAsync(w => w.Id == workout.Id);
        remaining.Should().BeNull();
    }
}
