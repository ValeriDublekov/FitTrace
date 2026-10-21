using FitTrace.Core.Entities;
using FitTrace.Core.Enums;
using FitTrace.Core.Services;
using FitTrace.Data;
using FitTrace.Data.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Добавяне на контролери
builder.Services.AddControllers();

// Режим на базата: InMemory/Dev за локална среда или PostgreSQL за домашния сървър
var isDevEnvironment = builder.Configuration.GetValue<bool>("USE_DEV_DB") 
    || Environment.GetEnvironmentVariable("USE_DEV_DB") == "true"
    || builder.Environment.IsDevelopment();

if (isDevEnvironment)
{
    // Използва InMemory доставчик за надеждно и изолирано тестване в локалната конзола
    builder.Services.AddDbContext<AppDbContext>(options =>
    {
        options.UseInMemoryDatabase("FitTrace_LocalDev_Db");
    });
}
else
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
        ?? "Host=localhost;Port=5432;Database=fittrace;Username=fittrace;Password=fittrace_secret";

    builder.Services.AddDbContext<AppDbContext>(options =>
    {
        options.UseNpgsql(connectionString);
    });
}

// Dependency Injection на бизнес услугите (SOLID / DIP)
builder.Services.AddScoped<IWorkoutService, WorkoutService>();
builder.Services.AddScoped<IExerciseService, ExerciseService>();
builder.Services.AddScoped<IProgressService, ProgressService>();

// CORS за PWA мобилния клиент
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowPwaClient", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Автоматично инициализиране на схемата при InMemory/Dev режим за лесно тестване
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    // Зареждане на тестов потребител
    var defaultUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    if (!db.Users.Any(u => u.Id == defaultUserId))
    {
        db.Users.Add(new User
        {
            Id = defaultUserId,
            Email = "demo-athlete@fittrace.local",
            PasswordHash = "demo_hash",
            Role = "User",
            CreatedAt = DateTime.UtcNow
        });
        db.SaveChanges();
    }

    // Зареждане на базов набор от упражнения, ако таблицата е празна
    if (!db.Exercises.Any())
    {
        db.Exercises.AddRange(
            new Exercise { Name = "Bench Press", Category = "Chest", LoadType = LoadType.WEIGHT_REPS, AffectedPart = "Chest" },
            new Exercise { Name = "Incline Dumbbell Press", Category = "Chest", LoadType = LoadType.WEIGHT_REPS, AffectedPart = "Upper Chest" },
            new Exercise { Name = "Squat (Barbell)", Category = "Legs", LoadType = LoadType.WEIGHT_REPS, AffectedPart = "Quadriceps" },
            new Exercise { Name = "Romanian Deadlift", Category = "Legs", LoadType = LoadType.WEIGHT_REPS, AffectedPart = "Hamstrings" },
            new Exercise { Name = "Pull-Ups", Category = "Back", LoadType = LoadType.WEIGHT_REPS, AffectedPart = "Lats" },
            new Exercise { Name = "Barbell Row", Category = "Back", LoadType = LoadType.WEIGHT_REPS, AffectedPart = "Upper Back" },
            new Exercise { Name = "Overhead Press", Category = "Shoulders", LoadType = LoadType.WEIGHT_REPS, AffectedPart = "Delts" },
            new Exercise { Name = "Bicep Curl", Category = "Arms", LoadType = LoadType.WEIGHT_REPS, AffectedPart = "Biceps" }
        );
        db.SaveChanges();
    }
}

app.UseCors("AllowPwaClient");

app.MapGet("/health", () => Results.Ok(new 
{ 
    status = "healthy", 
    framework = ".NET 9", 
    database = isDevEnvironment ? "In-Memory Relational (Self-Contained Dev/Test)" : "PostgreSQL",
    timestamp = DateTime.UtcNow 
}));

app.MapControllers();

app.Run();
