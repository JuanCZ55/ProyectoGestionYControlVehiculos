using AutoMapper;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("api/personas")]
[ApiController]
[Authorize]
public class ControllerPersona : ControllerBase
{
    private readonly ServicePersona _servicePersona;
    private readonly IMapper mapper;
    private readonly ServiceAuditoria _serviceAuditoria;

    public ControllerPersona(
        ServicePersona servicePersona,
        IMapper mapper,
        ServiceAuditoria serviceAuditoria
    )
    {
        _servicePersona = servicePersona;
        _serviceAuditoria = serviceAuditoria;
        this.mapper = mapper;
    }

    // GET TODAS LAS PERSONAS
    [HttpGet]
    public async Task<IActionResult> GetAllPersonas(
        [FromQuery] int numeroPagina = 1,
        [FromQuery] int tamanoPagina = 10
    )
    {
        PagedResponse<Persona> personas = await _servicePersona.GetAllAsync(
            numeroPagina,
            tamanoPagina
        );
        return Ok(personas);
    }

    // GET PERSONA POR ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetPersonaById(int id)
    {
        var persona = await _servicePersona.GetByIdAsync(id);
        if (persona == null)
        {
            return NotFound();
        }
        return Ok(persona);
    }

    // POST NUEVA PERSONA
    [HttpPost]
    public async Task<IActionResult> AddPersona([FromBody] CreatePersonaDto personaDto)
    {
        Persona persona = mapper.Map<Persona>(personaDto);
        try
        {
            var newPersona = await _servicePersona.AddAsync(persona);
            await _serviceAuditoria.AddAsync(
                new CreateAuditoriaDto
                {
                    IdEntidad = newPersona.IdPersona,
                    Entidad = NombreClases.Persona,
                    Accion = nameof(AddPersona),
                }
            );
            return CreatedAtAction(
                nameof(GetPersonaById),
                new { id = newPersona.IdPersona },
                newPersona
            );
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // PUT ACTUALIZAR PERSONA
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePersona(int id, [FromBody] UpdatePersonaDto personaDto)
    {
        if (id <= 0)
        {
            return BadRequest("El id debe ser mayor a 0");
        }
        Persona persona = mapper.Map<Persona>(personaDto);
        persona.IdPersona = id;

        try
        {
            await _servicePersona.UpdateAsync(id, personaDto);
            await _serviceAuditoria.AddAsync(
                new CreateAuditoriaDto
                {
                    IdEntidad = id,
                    Entidad = NombreClases.Persona,
                    Accion = nameof(UpdatePersona),
                }
            );
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // DELETE PERSONA
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePersona(int id)
    {
        var deleted = await _servicePersona.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound();
        }
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = id,
                Entidad = NombreClases.Persona,
                Accion = nameof(DeletePersona),
            }
        );
        return NoContent();
    }

    // BAJA LOGICA PERSONA
    [HttpPatch("baja/{id}")]
    public async Task<IActionResult> SoftDeletePersona(int id)
    {
        var softDeleted = await _servicePersona.SoftDeleteAsync(id);
        if (!softDeleted)
        {
            return NotFound();
        }
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = id,
                Entidad = NombreClases.Persona,
                Accion = nameof(SoftDeletePersona),
            }
        );
        return NoContent();
    }

    // ALTA LOGICA PERSONA
    [HttpPatch("alta/{id}")]
    public async Task<IActionResult> RestorePersona(int id)
    {
        var restored = await _servicePersona.RestoreAsync(id);
        if (!restored)
        {
            return NotFound();
        }
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = id,
                Entidad = NombreClases.Persona,
                Accion = nameof(RestorePersona),
            }
        );
        return NoContent();
    }
}
