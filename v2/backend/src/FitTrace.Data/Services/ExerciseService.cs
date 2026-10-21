using FitTrace.Core.DTOs;
using FitTrace.Core.Entities;
using FitTrace.Core.Services;
using Microsoft.EntityFrameworkCore;

namespace FitTrace.Data.Services;

public class ExerciseService : IExerciseService
{
    private readonly AppDbContext _context;

    public ExerciseService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ExerciseDto>> GetExercisesAsync(Guid userId)
    {
        var exercises = await _context.Exercises
            .AsNoTracking()
            .Where(e => !e.IsCustom || e.UserId == userId)
            .OrderBy(e => e.Category)
            .ThenBy(e => e.Name)
            .ToListAsync();

        return exercises.Select(MapToDto).ToList();
    }

    public async Task<ExerciseDto?> GetExerciseByIdAsync(Guid exerciseId, Guid userId)
    {
        var exercise = await _context.Exercises
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == exerciseId && (!e.IsCustom || e.UserId == userId));

        return exercise != null ? MapToDto(exercise) : null;
    }

    public async Task<ExerciseDto> CreateCustomExerciseAsync(Guid userId, CreateExerciseDto dto)
    {
        var exercise = new Exercise
        {
            Name = dto.Name.Trim(),
            Category = dto.Category.Trim(),
            LoadType = dto.LoadType,
            AffectedPart = dto.AffectedPart?.Trim(),
            ThumbnailUrl = dto.ThumbnailUrl,
            DefaultNotes = dto.DefaultNotes,
            Description = dto.Description,
            Url = dto.Url,
            IsCustom = true,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Exercises.Add(exercise);
        await _context.SaveChangesAsync();

        return MapToDto(exercise);
    }

    public async Task<bool> DeleteCustomExerciseAsync(Guid exerciseId, Guid userId)
    {
        var exercise = await _context.Exercises
            .FirstOrDefaultAsync(e => e.Id == exerciseId && e.IsCustom && e.UserId == userId);

        if (exercise == null)
        {
            return false;
        }

        _context.Exercises.Remove(exercise);
        await _context.SaveChangesAsync();
        return true;
    }

    private static ExerciseDto MapToDto(Exercise e) => new(
        e.Id,
        e.Name,
        e.Category,
        e.LoadType,
        e.AffectedPart,
        e.ThumbnailUrl,
        e.DefaultNotes,
        e.Description,
        e.Url,
        e.IsCustom,
        e.UserId
    );
}
