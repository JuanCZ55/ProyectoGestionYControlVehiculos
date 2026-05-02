using AutoMapper;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

[Route("api/matafuegos")]
[ApiController]
[Authorize]
public class ControllerMatafuego : ControllerBase
{
    private readonly ServiceMatafuego _serviceMatafuego;
    private readonly IMapper mapper;
    private readonly ServiceAuditoria _serviceAuditoria;

    public ControllerMatafuego(
        ServiceMatafuego serviceMatafuego,
        IMapper mapper,
        ServiceAuditoria serviceAuditoria
    )
    {
        _serviceMatafuego = serviceMatafuego;
        _serviceAuditoria = serviceAuditoria;
        this.mapper = mapper;
    }

    // GET TODOS LOS MATAFUEGOS
    [HttpGet]
    public async Task<IActionResult> GetAllMatafuegos(
        [FromQuery] int numeroPagina = 1,
        [FromQuery] int tamanoPagina = 10
    )
    {
        PagedResponse<Matafuego> matafuegos = await _serviceMatafuego.GetAllAsync(
            numeroPagina,
            tamanoPagina
        );
        return Ok(matafuegos);
    }

    // GET MATAFUEGO POR ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetMatafuegoById(int id)
    {
        var matafuego = await _serviceMatafuego.GetByIdAsync(id);
        if (matafuego == null)
        {
            return NotFound();
        }
        return Ok(matafuego);
    }

    // POST NUEVO MATAFUEGO
    [HttpPost]
    public async Task<IActionResult> AddMatafuego([FromBody] CreateMatafuegoDto matafuegoDto)
    {
        Matafuego matafuego = mapper.Map<Matafuego>(matafuegoDto);
        var newMatafuego = await _serviceMatafuego.AddAsync(matafuego);
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = newMatafuego.IdMatafuego,
                Entidad = NombreClases.Matafuego,
                Accion = nameof(AddMatafuego),
            }
        );
        return CreatedAtAction(
            nameof(GetMatafuegoById),
            new { id = newMatafuego.IdMatafuego },
            newMatafuego
        );
    }

    // PUT ACTUALIZAR MATAFUEGO
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMatafuego(
        int id,
        [FromBody] UpdateMatafuegoDto matafuego
    )
    {
        if (id <= 0)
        {
            return BadRequest("El id debe ser mayor a 0");
        }
        try
        {
            await _serviceMatafuego.UpdateAsync(id, matafuego);
            await _serviceAuditoria.AddAsync(
                new CreateAuditoriaDto
                {
                    IdEntidad = id,
                    Entidad = NombreClases.Matafuego,
                    Accion = nameof(UpdateMatafuego),
                }
            );
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            System.Console.WriteLine(ex.Message);
            return NotFound(new { message = ex.Message });
        }
    }

    // DELETE MATAFUEGO
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMatafuego(int id)
    {
        var deleted = await _serviceMatafuego.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound();
        }
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = id,
                Entidad = NombreClases.Matafuego,
                Accion = nameof(DeleteMatafuego),
            }
        );
        return NoContent();
    }

    // BAJA LOGICA MATAFUEGO
    [HttpPatch("baja/{id}")]
    public async Task<IActionResult> SoftDeleteMatafuego(int id)
    {
        var result = await _serviceMatafuego.SoftDeleteAsync(id);
        if (!result)
        {
            return NotFound();
        }
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = id,
                Entidad = NombreClases.Matafuego,
                Accion = nameof(SoftDeleteMatafuego),
            }
        );
        return NoContent();
    }

    // ALTA LOGICA MATAFUEGO
    [HttpPatch("alta/{id}")]
    public async Task<IActionResult> RestoreMatafuego(int id)
    {
        var result = await _serviceMatafuego.RestoreAsync(id);
        if (!result)
        {
            return NotFound();
        }
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = id,
                Entidad = NombreClases.Matafuego,
                Accion = nameof(RestoreMatafuego),
            }
        );
        return NoContent();
    }

    [HttpGet("buscarPorNroSerie/{nroSerieLike}")]
    public async Task<IActionResult> GetMatafuegoByNroSerieLike(string nroSerieLike)
    {
        var matafuegos = await _serviceMatafuego.getMatafuegoByNroSerieLike(nroSerieLike);
        System.Console.WriteLine(matafuegos);
        if (matafuegos == null || matafuegos.Count == 0)
        {
            return NotFound();
        }
        return Ok(matafuegos);
    }
    // ACA HAY Q VER TAMBIEN EL TEMA DE LA CARGA DE DOCUMENTOS RELACIONADOS
}
