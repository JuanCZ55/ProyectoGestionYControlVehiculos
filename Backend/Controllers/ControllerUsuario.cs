using System.Security.Claims;
using AutoMapper;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

[Route("api/usuarios")]
[ApiController]
[Authorize]
public class ControllerUsuario : ControllerBase
{
    private readonly ServiceUsuario _serviceUsuario;
    private readonly ServiceRol _serviceRol;
    private readonly IMapper mapper;

    public ControllerUsuario(ServiceUsuario serviceUsuario, IMapper mapper, ServiceRol serviceRol)
    {
        _serviceUsuario = serviceUsuario;
        _serviceRol = serviceRol;
        this.mapper = mapper;
    }

    [Authorize(Policy = "RequireAdmin")]
    // GET TODOS LOS USUARIOS
    [HttpGet]
    public async Task<IActionResult> GetAllUsuarios(
        [FromQuery] int numeroPagina = 1,
        [FromQuery] int tamanoPagina = 10
    )
    {
        PagedResponse<UsuarioDto> usuarios = await _serviceUsuario.GetAllAsync(
            numeroPagina,
            tamanoPagina
        );
        return Ok(usuarios);
    }

    [Authorize(Policy = "Everyone")]
    // GET USUARIO POR ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUsuarioById(int id)
    {
        var usuario = await _serviceUsuario.GetByIdAsync(id);
        if (usuario == null)
        {
            return NotFound();
        }
        return Ok(usuario);
    }

    [Authorize(Policy = "RequireAdmin")]
    // POST NUEVO USUARIO
    [HttpPost]
    public async Task<IActionResult> CreateUsuario([FromBody] CreateUsuarioDto usuarioDto)
    {
        Usuario usu = mapper.Map<Usuario>(usuarioDto);
        try
        {
            var newUsuario = await _serviceUsuario.AddAsync(usu);
            return CreatedAtAction(
                nameof(GetUsuarioById),
                new { id = newUsuario.IdUsuario },
                newUsuario
            );
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    [Authorize(Policy = "RequireAdmin")]
    // PUT ACTUALIZAR USUARIO
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUsuario(int id, [FromBody] UpdateUsuarioDto usuarioDto)
    {
        if (id <= 0)
        {
            return BadRequest("El id debe ser mayor a 0");
        }

        Usuario usuario = mapper.Map<Usuario>(usuarioDto);
        usuario.IdUsuario = id;
        try
        {
            await _serviceUsuario.UpdateAsync(id, usuarioDto);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensaje = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    [Authorize(Policy = "RequireAdmin")]
    // DELETE USUARIO
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUsuario(int id)
    {
        var deleted = await _serviceUsuario.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound();
        }
        return NoContent();
    }

    [Authorize(Policy = "RequireAdmin")]
    // BAJA LOGICA USUARIO
    [HttpPatch("baja/{id}")]
    public async Task<IActionResult> SoftDeleteUsuario(int id)
    {
        var softDeleted = await _serviceUsuario.SoftDeleteAsync(id);
        if (!softDeleted)
        {
            return NotFound();
        }
        return NoContent();
    }

    [Authorize(Policy = "RequireAdmin")]
    // ALTA LOGICA USUARIO
    [HttpPatch("alta/{id}")]
    public async Task<IActionResult> RestoreUsuario(int id)
    {
        var restored = await _serviceUsuario.RestoreAsync(id);
        if (!restored)
        {
            return NotFound();
        }
        return NoContent();
    }

    [Authorize(Policy = "RequireAdmin")]
    [HttpPut("rol/{id}")]
    public async Task<IActionResult> UpdateRolUsuario(int id)
    {
        try
        {
            if (Int32.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value) == id)
            {
                return BadRequest("No puedes cambiar el rol de ti mismo");
            }

            await _serviceUsuario.UpdateRolUsuario(id);
            UsuarioDto? usuarioFinded = await _serviceUsuario.GetByIdAsync(id);
            if (usuarioFinded == null)
            {
                return NotFound("Usuario con id " + id + " no encontrado");
            }
            Rol? rolFinded = await _serviceRol.GetByIdAsync(usuarioFinded.IdRol);
            if (rolFinded == null)
            {
                return NotFound($"Rol con id {usuarioFinded.IdRol} no encontrado");
            }
            var rol = new { idRol = usuarioFinded.IdRol, nombre = rolFinded.Nombre };
            return Ok(rol);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensaje = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    [Authorize(Policy = "RequireAdmin")]
    [HttpPut("reset/{id}")]
    public async Task<IActionResult> ResetPassword(int id)
    {
        try
        {
            await _serviceUsuario.resetPassword(id, "Reset123456!");
            return Ok(new { message = "Contraseña reseteada: Reset123456!" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensaje = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    [Authorize(Policy = "Everyone")]
    [HttpPut("cambiarContrasena/{id}")]
    public async Task<IActionResult> updatePassword(
        int id,
        [FromBody] UpdatePasswordDto newPassword
    )
    {
        try
        {
            await _serviceUsuario.resetPassword(id, newPassword.NewPassword);
            return Ok(new { message = "Contraseña reseteada" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensaje = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    [Authorize(policy: "Everyone")]
    [HttpPut("email/{id}")]
    public async Task<IActionResult> updateEmail(int id, [FromBody] UpdateGmailDto emailDto)
    {
        try
        {
            await _serviceUsuario.updateEmail(id, emailDto.Gmail!);
            return Ok("Email actualizado");
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensaje = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    [Authorize(Policy = "Everyone")]
    [HttpPost("avatar/{id}")]
    [Consumes("multipart/form-data")] // <-- ESTO ES CLAVE PARA SWAGGER
    public async Task<IActionResult> updateAvatar(
        [FromRoute] int id,
        [FromForm] AvatarUploadDto avatar
    )
    {
        if (id <= 0)
            return BadRequest("El id debe ser mayor a 0");
        try
        {
            if (!await _serviceUsuario.updateAvatar(id, avatar.avatar))
                return BadRequest("No se pudo actualizar el avatar");
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensaje = ex.Message });
        }
    }

    [AllowAnonymous]
    [HttpGet("avatar/{id}")]
    public async Task<IActionResult> getAvatar(int id)
    {
        if (id <= 0)
            return BadRequest("El id debe ser mayor a 0");
        try
        {
            string? rutaAvatar = await _serviceUsuario.getRutaAvatar(id);
            if (rutaAvatar == null)
                return NotFound("No se encontro el avatar");
            var extension = Path.GetExtension(rutaAvatar).ToLowerInvariant();
            string tipoMime = extension switch
            {
                ".png" => "image/png",
                ".jpg" => "image/jpeg",
                ".jpeg" => "image/jpeg",
                _ => "application/octet-stream", // Tipo por defecto
            };
            return PhysicalFile(rutaAvatar, tipoMime);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensaje = ex.Message });
        }
    }
}
