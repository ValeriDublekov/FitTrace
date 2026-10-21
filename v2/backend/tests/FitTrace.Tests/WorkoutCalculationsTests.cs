using FitTrace.Core.DTOs;
using FitTrace.Core.Entities;
using FitTrace.Core.Services;
using FluentAssertions;
using Xunit;

namespace FitTrace.Tests;

public class WorkoutCalculationsTests
{
    [Fact]
    public void CalculateEpleyOneRepMax_WithSingleRep_ReturnsExactWeight()
    {
        // Arrange
        decimal weight = 100m;
        int reps = 1;

        // Act
        decimal result = ProgressCalculator.CalculateEpleyOneRepMax(weight, reps);

        // Assert
        result.Should().Be(100m);
    }

    [Fact]
    public void CalculateEpleyOneRepMax_WithMultipleReps_CalculatesAccurately()
    {
        // 100 * (1 + 10 / 30) = 133.33
        decimal weight = 100m;
        int reps = 10;

        decimal result = ProgressCalculator.CalculateEpleyOneRepMax(weight, reps);

        result.Should().Be(133.33m);
    }

    [Theory]
    [InlineData(0, 5)]
    [InlineData(100, 0)]
    [InlineData(-50, 10)]
    public void CalculateEpleyOneRepMax_WithInvalidInput_ReturnsZero(decimal weight, int reps)
    {
        decimal result = ProgressCalculator.CalculateEpleyOneRepMax(weight, reps);
        result.Should().Be(0);
    }

    [Fact]
    public void CalculateBrzyckiOneRepMax_WithValidReps_ReturnsEstimatedWeight()
    {
        // 100 / (1.0278 - 0.0278 * 10) = 100 / 0.7498 = 133.37
        decimal weight = 100m;
        int reps = 10;

        decimal result = ProgressCalculator.CalculateBrzyckiOneRepMax(weight, reps);

        result.Should().Be(133.37m);
    }

    [Fact]
    public void CalculateSetVolume_WithValidWeightAndReps_ReturnsMultiplication()
    {
        decimal? weight = 80m;
        int? reps = 12;

        decimal volume = ProgressCalculator.CalculateSetVolume(weight, reps);

        volume.Should().Be(960m);
    }

    [Fact]
    public void CalculateSetVolume_WithNullOrZero_ReturnsZero()
    {
        ProgressCalculator.CalculateSetVolume(null, 10).Should().Be(0);
        ProgressCalculator.CalculateSetVolume(100m, null).Should().Be(0);
        ProgressCalculator.CalculateSetVolume(0m, 10).Should().Be(0);
    }

    [Fact]
    public void CalculateWorkoutTotalVolume_SumsAllCompletedSetsAcrossExercises()
    {
        var exercises = new List<WorkoutExercise>
        {
            new()
            {
                Sets = new List<ExerciseSet>
                {
                    new() { Weight = 100m, Reps = 5, IsCompleted = true }, // 500
                    new() { Weight = 100m, Reps = 5, IsCompleted = true }, // 500
                    new() { Weight = 100m, Reps = 5, IsCompleted = false } // skipped
                }
            },
            new()
            {
                Sets = new List<ExerciseSet>
                {
                    new() { Weight = 50m, Reps = 10, IsCompleted = true } // 500
                }
            }
        };

        decimal totalVolume = ProgressCalculator.CalculateWorkoutTotalVolume(exercises);

        totalVolume.Should().Be(1500m);
    }

    [Fact]
    public void NormalizeSets_ReindexesSetsSequentiallyStartingFromOne()
    {
        var inputSets = new List<ExerciseSetDto>
        {
            new(SetIndex: 5, Weight: 60m, Reps: 10, Level: null, DurationSeconds: null, IsCompleted: true),
            new(SetIndex: 99, Weight: 65m, Reps: 8, Level: null, DurationSeconds: null, IsCompleted: true),
            new(SetIndex: 0, Weight: 70m, Reps: 6, Level: null, DurationSeconds: null, IsCompleted: true)
        };

        var normalized = ProgressCalculator.NormalizeSets(inputSets);

        normalized.Should().HaveCount(3);
        normalized[0].SetIndex.Should().Be(1);
        normalized[1].SetIndex.Should().Be(2);
        normalized[2].SetIndex.Should().Be(3);
    }
}
