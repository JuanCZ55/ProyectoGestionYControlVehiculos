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
    private readonly ServicePassword _servicePassword;

    public ControllerAuth(ServiceAuth serviceAuth, ServiceAuditoria serviceAuditoria, ServicePassword servicePassword)
    {
        _serviceAuth = serviceAuth;
        _serviceAuditoria = serviceAuditoria;
        _servicePassword = servicePassword;
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
    //[HttpGet("contrasena")]
    //public async Task<IActionResult> GetContrasena()
    //{
    //    string password = _servicePassword.HashPassword("Prueba1@");

    //    return Ok(new { password });
    //}
    //[HttpGet("contrasenavalidate")]
    //public async Task<IActionResult> GetValidate()
    //{
    //    bool password = _servicePassword.VerifyPassword("123456","$2a$11$nkC0chfRG91ptzs/b6axmevKvm9egWW2z.q8a9IuvaIVrRGoe6AHO");

    //    return Ok(new { password });
    //}
}
