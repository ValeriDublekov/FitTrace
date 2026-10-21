using FitTrace.Core.DTOs;
using FitTrace.Core.Services;
using Microsoft.AspNetCore.Mvc;

namespace FitTrace.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProgressController : ControllerBase
{
    private readonly IProgressService _progressService;

    public ProgressController(IProgressService progressService)
    {
        _progressService = progressService;
    }

    private Guid GetCurrentUserId()
    {
        if (Request.Headers.TryGetValue("X-User-Id", out var headerVal) && Guid.TryParse(headerVal, out var userId))
        {
            return userId;
        }

        return Guid.Parse("11111111-1111-1111-1111-111111111111");
    }

    [HttpGet("exercise/{exerciseId:guid}")]
    public async Task<ActionResult<ExerciseProgressHistoryDto>> GetExerciseProgress(Guid exerciseId)
    {
        var userId = GetCurrentUserId();
        var progress = await _progressService.GetExerciseProgressHistoryAsync(exerciseId, userId);
        if (progress == null)
        {
            return NotFound(new { message = "Exercise not found or no access." });
        }
        return Ok(progress);
    }

    [HttpGet("summary")]
    public async Task<ActionResult<WorkoutSummaryDto>> GetSummary()
    {
        var userId = GetCurrentUserId();
        var summary = await _progressService.GetUserSummaryAsync(userId);
        return Ok(summary);
    }
}
