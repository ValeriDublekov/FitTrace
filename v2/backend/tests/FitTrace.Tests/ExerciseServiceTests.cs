using FitTrace.Core.DTOs;
using FitTrace.Core.Entities;
using FitTrace.Core.Enums;
using FitTrace.Data;
using FitTrace.Data.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace FitTrace.Tests;

public class ExerciseServiceTests
{
    private static AppDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task GetExercisesAsync_ReturnsGlobalExercisesAndUserCustomExercisesOnly()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var service = new ExerciseService(context);

        var userA = Guid.NewGuid();
        var userB = Guid.NewGuid();

        // 1. Global exercise
        context.Exercises.Add(new Exercise
        {
            Name = "Squat",
            Category = "Legs",
            LoadType = LoadType.WEIGHT_REPS,
            IsCustom = false,
            UserId = null
        });

        // 2. Custom exercise for User A
        context.Exercises.Add(new Exercise
        {
            Name = "Custom User A Exercise",
            Category = "Legs",
            LoadType = LoadType.WEIGHT_REPS,
            IsCustom = true,
            UserId = userA
        });

        // 3. Custom exercise for User B
        context.Exercises.Add(new Exercise
        {
            Name = "Custom User B Exercise",
            Category = "Arms",
            LoadType = LoadType.WEIGHT_REPS,
            IsCustom = true,
            UserId = userB
        });

        await context.SaveChangesAsync();

        // Act
        var userAExercises = await service.GetExercisesAsync(userA);

        // Assert
        userAExercises.Should().HaveCount(2);
        userAExercises.Select(e => e.Name).Should().Contain(new[] { "Squat", "Custom User A Exercise" });
        userAExercises.Select(e => e.Name).Should().NotContain("Custom User B Exercise");
    }

    [Fact]
    public async Task CreateCustomExerciseAsync_CreatesExerciseWithIsCustomTrueAndUserAssigned()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var service = new ExerciseService(context);
        var userId = Guid.NewGuid();

        var dto = new CreateExerciseDto(
            Name: "Cable Lateral Raise",
            Category: "Shoulders",
            LoadType: LoadType.WEIGHT_REPS,
            AffectedPart: "Side Delts",
            ThumbnailUrl: null,
            DefaultNotes: "Use light weight",
            Description: null,
            Url: null
        );

        // Act
        var created = await service.CreateCustomExerciseAsync(userId, dto);

        // Assert
        created.Should().NotBeNull();
        created.Name.Should().Be("Cable Lateral Raise");
        created.IsCustom.Should().BeTrue();
        created.UserId.Should().Be(userId);

        var inDb = await context.Exercises.FirstOrDefaultAsync(e => e.Id == created.Id);
        inDb.Should().NotBeNull();
        inDb!.IsCustom.Should().BeTrue();
    }
}
