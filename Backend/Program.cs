using System.Net;
using System.Text;
using Backend.Profiles;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerUI;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
var connectionString = builder.Configuration.GetConnectionString("MySqlConnection");
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173").AllowAnyMethod().AllowAnyHeader();
        }
    );
});
builder.Services.AddDbContextPool<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
);
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings.GetValue<string>("Key")!);
builder
    .Services.AddAuthentication(config =>
    {
        config.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        config.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(config =>
    {
        config.RequireHttpsMetadata = false;
        config.SaveToken = true;
        config.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ClockSkew = TimeSpan.Zero,
            IssuerSigningKey = new SymmetricSecurityKey(key),
        };
    });
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdmin", policy => policy.RequireRole("1"));
    options.AddPolicy("RequireUser", policy => policy.RequireRole("2"));
    options.AddPolicy("Everyone", policy => policy.RequireRole("1", "2"));
});

//En los endopints de la API agregar [Authorize(Policy = "RequireAdmin")]
builder.Services.AddHttpContextAccessor();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ArgenCore API", Version = "v1" });
    // 1. Definimos el esquema de seguridad (Cómo se llama la llave)
    c.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = $"Bearer {key}",
        }
    );

    // 2. Aplicamos el requisito de seguridad de forma global
    c.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer",
                    },
                },
                new string[] { }
            },
        }
    );
});
builder.Services.AddScoped<ServiceAuditoria>();
builder.Services.AddScoped<ServiceChecklistDiario>();
builder.Services.AddScoped<ServiceDocumento>();
builder.Services.AddScoped<ServiceMatafuego>();
builder.Services.AddScoped<ServiceMensajeChat>();
builder.Services.AddScoped<ServiceNeumatico>();
builder.Services.AddScoped<ServicePersona>();
builder.Services.AddScoped<ServicePosicionNeumatico>();
builder.Services.AddScoped<ServiceRegistroKilometraje>();
builder.Services.AddScoped<ServiceRol>();
builder.Services.AddScoped<ServiceService>();
builder.Services.AddScoped<ServiceUsuario>();
builder.Services.AddScoped<ServiceVehiculo>();
builder.Services.AddScoped<ServicenToken>();
builder.Services.AddScoped<ServicePassword>();
builder.Services.AddScoped<ServiceAuth>();
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// builder.Services.AddAutoMapper(cfg =>
// {
//     cfg.AddProfile<MappingProfile>();
// });
var app = builder.Build();
app.UseExceptionHandler(appError =>
{
    appError.Run(async context =>
    {
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
        context.Response.ContentType = "application/json";
        var exceptionHandlerFeature = context.Features.Get<IExceptionHandlerFeature>();
        if (exceptionHandlerFeature != null)
        {
            var logger = app.Services.GetRequiredService<ILogger<Program>>();
            var exception = exceptionHandlerFeature.Error;
            var errorSource = exception.TargetSite;
            var sourceClass = errorSource?.DeclaringType?.FullName;
            var sourceMethod = errorSource?.Name;
            var logMessage =
                @$"
                --------------------------------------------------------------------------
                [ ERROR CRÍTICO NO CONTROLADO ]
                Clase : {sourceClass}
                Metodo: {sourceMethod}
                Error : {exception.Message}
                --------------------------------------------------------------------------
                ";
            logger.LogError(exception, logMessage, context.Request.Path, exception.Message);
        }
        await context.Response.WriteAsJsonAsync(
            new
            {
                StatusCode = context.Response.StatusCode,
                Message = "Ocurrio un error interno en el servidor",
            }
        );
    });
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.DocExpansion(DocExpansion.None);
    });
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
