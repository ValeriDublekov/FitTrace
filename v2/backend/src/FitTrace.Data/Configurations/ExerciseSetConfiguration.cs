using FitTrace.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FitTrace.Data.Configurations;

public class ExerciseSetConfiguration : IEntityTypeConfiguration<ExerciseSet>
{
    public void Configure(EntityTypeBuilder<ExerciseSet> builder)
    {
        builder.ToTable("exercise_sets");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Weight)
            .HasPrecision(8, 2);

        builder.HasIndex(s => new { s.WorkoutExerciseId, s.SetIndex });
    }
}
