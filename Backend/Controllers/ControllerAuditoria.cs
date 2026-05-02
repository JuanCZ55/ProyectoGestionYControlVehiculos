using AutoMapper;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

[Route("api/auditorias")]
[ApiController]
public class ControllerAuditoria : ControllerBase
{
    private readonly ServiceAuditoria _serviceAuditoria;
    private readonly IMapper mapper;

    public ControllerAuditoria(ServiceAuditoria serviceAuditoria, IMapper mapper)
    {
        _serviceAuditoria = serviceAuditoria;
        this.mapper = mapper;
    }

    // GET TODAS LAS AUDITORIAS
    [HttpGet]
    public async Task<IActionResult> GetAllAuditorias(
        [FromQuery] int numeroPagina = 1,
        [FromQuery] int tamanoPagina = 10
    )
    {
        PagedResponse<AuditoriaDto>? auditorias = await _serviceAuditoria.GetAllAsync(
            numeroPagina,
            tamanoPagina
        );
        return Ok(auditorias);
    }

    // GET AUDITORIA POR ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetAuditoriaById(int id)
    {
        Auditoria? auditoria = await _serviceAuditoria.GetByIdAsync(id);
        if (auditoria == null)
        {
            return NotFound();
        }
        return Ok(auditoria);
    }

    // POST NUEVA AUDITORIA
    // [HttpPost]
    // public async Task<IActionResult> AddAuditoria([FromBody] CreateAuditoriaDto auditoriaDto)
    // {
    //     Auditoria auditoria = mapper.Map<Auditoria>(auditoriaDto);
    //     //Auditoria newAuditoria = await _serviceAuditoria.AddAsync(auditoriaDto);
    //     return CreatedAtAction(
    //         nameof(GetAuditoriaById),
    //         new { id = newAuditoria.IdAuditoria },
    //         newAuditoria
    //     );
    // }

    // PUT ACTUALIZAR AUDITORIA
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAuditoria(
        int id,
        [FromBody] UpdateAuditoriaDto auditoriaDto
    )
    {
        if (id <= 0)
        {
            return BadRequest(" El id de la auditoria debe ser mayor a 0.");
        }
        Auditoria auditoria = mapper.Map<Auditoria>(auditoriaDto);
        auditoria.IdAuditoria = id;
        try
        {
            await _serviceAuditoria.UpdateAsync(auditoria);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // DELETE AUDITORIA
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAuditoria(int id)
    {
        try
        {
            await _serviceAuditoria.DeleteAsync(id);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        return NoContent();
    }

    //FALTA HACER EL CONTROLLER QUE USA EL SERVICIO Q REVISA ENTITY NAME Y SU ID PARA TRAERLO SEGUN NECESARIO
}
