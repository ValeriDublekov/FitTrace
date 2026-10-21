using FitTrace.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FitTrace.Data.Configurations;

public class WorkoutTemplateConfiguration : IEntityTypeConfiguration<WorkoutTemplate>
{
    public void Configure(EntityTypeBuilder<WorkoutTemplate> builder)
    {
        builder.ToTable("workout_templates");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.HasMany(t => t.TemplateExercises)
            .WithOne(te => te.Template)
            .HasForeignKey(te => te.TemplateId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
