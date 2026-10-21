using FitTrace.Core.DTOs;
using FitTrace.Core.Services;
using Microsoft.AspNetCore.Mvc;

namespace FitTrace.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WorkoutsController : ControllerBase
{
    private readonly IWorkoutService _workoutService;

    public WorkoutsController(IWorkoutService workoutService)
    {
        _workoutService = workoutService;
    }

    private Guid GetCurrentUserId()
    {
        // Чете X-User-Id header или стандартен Claim, ако е наличен
        if (Request.Headers.TryGetValue("X-User-Id", out var headerVal) && Guid.TryParse(headerVal, out var userId))
        {
            return userId;
        }

        // Fallback за тестова/демо среда
        return Guid.Parse("11111111-1111-1111-1111-111111111111");
    }

    [HttpGet]
    public async Task<ActionResult<List<WorkoutResponseDto>>> GetWorkouts([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
    {
        var userId = GetCurrentUserId();
        var workouts = await _workoutService.GetUserWorkoutsAsync(userId, fromDate, toDate);
        return Ok(workouts);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<WorkoutResponseDto>> GetWorkoutById(Guid id)
    {
        var userId = GetCurrentUserId();
        var workout = await _workoutService.GetWorkoutByIdAsync(id, userId);
        if (workout == null)
        {
            return NotFound(new { message = "Workout not found" });
        }
        return Ok(workout);
    }

    [HttpPost]
    public async Task<ActionResult<WorkoutResponseDto>> CreateWorkout([FromBody] CreateWorkoutDto dto)
    {
        if (dto.Exercises == null || dto.Exercises.Count == 0)
        {
            return BadRequest(new { message = "At least one exercise is required." });
        }

        var userId = GetCurrentUserId();
        var created = await _workoutService.CreateWorkoutAsync(userId, dto);
        return CreatedAtAction(nameof(GetWorkoutById), new { id = created.Id }, created);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteWorkout(Guid id)
    {
        var userId = GetCurrentUserId();
        var success = await _workoutService.DeleteWorkoutAsync(id, userId);
        if (!success)
        {
            return NotFound(new { message = "Workout not found" });
        }
        return NoContent();
    }
}
