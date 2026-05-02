using AutoMapper;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("api/rol")]
[ApiController]
[Authorize]
public class ControllerRol : ControllerBase
{
    private readonly ServiceRol _serviceRol;
    private readonly ServiceAuditoria _serviceAuditoria;
    private readonly IMapper mapper;

    public ControllerRol(ServiceRol serviceRol, IMapper mapper, ServiceAuditoria serviceAuditoria)
    {
        _serviceRol = serviceRol;
        _serviceAuditoria = serviceAuditoria;
        this.mapper = mapper;
    }

    // GET TODOS LOS ROLES
    [HttpGet]
    public async Task<IActionResult> GetAllRoles(
        [FromQuery] int numeroPagina = 1,
        [FromQuery] int tamanoPagina = 10
    )
    {
        PagedResponse<Rol> roles = await _serviceRol.GetAllAsync(numeroPagina, tamanoPagina);
        return Ok(roles);
    }

    // GET ROL POR ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetRolById(int id)
    {
        var rol = await _serviceRol.GetByIdAsync(id);
        if (rol == null)
        {
            return NotFound();
        }
        return Ok(rol);
    }

    // POST NUEVO ROL
    [HttpPost]
    public async Task<IActionResult> CreateRol([FromBody] CreateRolDto rolDto)
    {
        Rol rol = mapper.Map<Rol>(rolDto);
        var newRol = await _serviceRol.AddAsync(rol);
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = newRol.IdRol,
                Entidad = NombreClases.Rol,
                Accion = nameof(CreateRol),
            }
        );
        return CreatedAtAction(nameof(GetRolById), new { id = newRol.IdRol }, newRol);
    }

    // PUT ACTUALIZAR ROL
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRol(int id, [FromBody] UpdateRolDto rolDto)
    {
        if (id <= 0)
        {
            return BadRequest("El id debe ser mayor a 0");
        }

        Rol rol = mapper.Map<Rol>(rolDto);
        rol.IdRol = id;
        try
        {
            await _serviceRol.UpdateAsync(id, rolDto);
            await _serviceAuditoria.AddAsync(
                new CreateAuditoriaDto
                {
                    IdEntidad = id,
                    Entidad = NombreClases.Rol,
                    Accion = nameof(UpdateRol),
                }
            );
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // DELETE ROL
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRol(int id)
    {
        var deleted = await _serviceRol.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound();
        }
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = id,
                Entidad = NombreClases.Rol,
                Accion = nameof(DeleteRol),
            }
        );
        return NoContent();
    }

    // BAJA LOGICA ROL
    [HttpPatch("baja/{id}")]
    public async Task<IActionResult> SoftDeleteRol(int id)
    {
        var softDeleted = await _serviceRol.SoftDeleteAsync(id);
        if (!softDeleted)
        {
            return NotFound();
        }
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = id,
                Entidad = NombreClases.Rol,
                Accion = nameof(SoftDeleteRol),
            }
        );
        return NoContent();
    }

    // ALTA LOGICA ROL
    [HttpPatch("alta/{id}")]
    public async Task<IActionResult> RestoreRol(int id)
    {
        var restored = await _serviceRol.RestoreAsync(id);
        if (!restored)
        {
            return NotFound();
        }
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = id,
                Entidad = NombreClases.Rol,
                Accion = nameof(RestoreRol),
            }
        );
        return NoContent();
    }
}
