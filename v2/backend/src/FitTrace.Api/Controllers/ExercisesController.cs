using FitTrace.Core.DTOs;
using FitTrace.Core.Services;
using Microsoft.AspNetCore.Mvc;

namespace FitTrace.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExercisesController : ControllerBase
{
    private readonly IExerciseService _exerciseService;

    public ExercisesController(IExerciseService exerciseService)
    {
        _exerciseService = exerciseService;
    }

    private Guid GetCurrentUserId()
    {
        if (Request.Headers.TryGetValue("X-User-Id", out var headerVal) && Guid.TryParse(headerVal, out var userId))
        {
            return userId;
        }

        return Guid.Parse("11111111-1111-1111-1111-111111111111");
    }

    [HttpGet]
    public async Task<ActionResult<List<ExerciseDto>>> GetExercises()
    {
        var userId = GetCurrentUserId();
        var exercises = await _exerciseService.GetExercisesAsync(userId);
        return Ok(exercises);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ExerciseDto>> GetExerciseById(Guid id)
    {
        var userId = GetCurrentUserId();
        var exercise = await _exerciseService.GetExerciseByIdAsync(id, userId);
        if (exercise == null)
        {
            return NotFound(new { message = "Exercise not found" });
        }
        return Ok(exercise);
    }

    [HttpPost]
    public async Task<ActionResult<ExerciseDto>> CreateCustomExercise([FromBody] CreateExerciseDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Category))
        {
            return BadRequest(new { message = "Name and Category are required." });
        }

        var userId = GetCurrentUserId();
        var created = await _exerciseService.CreateCustomExerciseAsync(userId, dto);
        return CreatedAtAction(nameof(GetExerciseById), new { id = created.Id }, created);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCustomExercise(Guid id)
    {
        var userId = GetCurrentUserId();
        var success = await _exerciseService.DeleteCustomExerciseAsync(id, userId);
        if (!success)
        {
            return NotFound(new { message = "Custom exercise not found or not owned by user." });
        }
        return NoContent();
    }
}
