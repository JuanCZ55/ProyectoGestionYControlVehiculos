using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class ControllerAuth : ControllerBase
{
    private readonly ServiceAuth _serviceAuth;
    private readonly ServiceAuditoria _serviceAuditoria;

    public ControllerAuth(ServiceAuth serviceAuth, ServiceAuditoria serviceAuditoria)
    {
        _serviceAuth = serviceAuth;
        _serviceAuditoria = serviceAuditoria;
    }

    [Authorize(Policy = "RequireAdmin")]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        try
        {
            Usuario? usuario = await _serviceAuth.Register(dto);
            if (usuario is null)
                return BadRequest("Error al registrar usuario");
            await _serviceAuditoria.AddAsync(
                new CreateAuditoriaDto
                {
                    IdEntidad = usuario.IdUsuario,
                    Entidad = NombreClases.Usuario,
                    Accion = nameof(Register),
                }
            );
            return Ok(new { message = "Registro exitoso" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception e)
        {
            return StatusCode(500, e.Message);
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        try
        {
            string token = await _serviceAuth.Login(dto);
            return Ok(new { token });
        }
        catch (KeyNotFoundException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception e)
        {
            return StatusCode(500, e.Message);
        }
    }
}
