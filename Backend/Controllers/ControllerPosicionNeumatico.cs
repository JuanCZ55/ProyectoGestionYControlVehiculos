using AutoMapper;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("api/posiciones-neumaticos")]
[ApiController]
[Authorize]
public class ControllerPosicionNeumatico : ControllerBase
{
    private readonly ServicePosicionNeumatico _servicePosicionNeumatico;
    private readonly ServiceAuditoria _serviceAuditoria;
    private readonly IMapper mapper;

    public ControllerPosicionNeumatico(
        ServicePosicionNeumatico servicePosicionNeumatico,
        ServiceAuditoria serviceAuditoria,
        IMapper mapper
    )
    {
        _serviceAuditoria = serviceAuditoria;
        _servicePosicionNeumatico = servicePosicionNeumatico;
        this.mapper = mapper;
    }

    // GET TODAS LAS POSICIONES DE NEUMATICOS
    [HttpGet]
    public async Task<IActionResult> GetAllPosicionesNeumaticos(
        [FromQuery] int numeroPagina = 1,
        [FromQuery] int tamanoPagina = 10
    )
    {
        PagedResponse<PosicionNeumatico> posiciones = await _servicePosicionNeumatico.GetAllAsync(
            numeroPagina,
            tamanoPagina
        );
        return Ok(posiciones);
    }

    // GET POSICION DE NEUMATICO POR ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetPosicionNeumaticoById(int id)
    {
        var posicion = await _servicePosicionNeumatico.GetByIdAsync(id);
        if (posicion == null)
        {
            return NotFound();
        }
        return Ok(posicion);
    }

    // POST NUEVA POSICION DE NEUMATICO
    [HttpPost]
    public async Task<IActionResult> AddPosicionNeumatico(
        [FromBody] CreatePosicionNeumaticoDto posicionNeumaticoDto
    )
    {
        PosicionNeumatico posicionNeumatico = mapper.Map<PosicionNeumatico>(posicionNeumaticoDto);
        var newPosicion = await _servicePosicionNeumatico.AddAsync(posicionNeumatico);
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = newPosicion.IdPosicionNeumatico,
                Entidad = NombreClases.PosicionNeumatico,
                Accion = nameof(AddPosicionNeumatico),
            }
        );
        return CreatedAtAction(
            nameof(GetPosicionNeumaticoById),
            new { id = newPosicion.IdPosicionNeumatico },
            newPosicion
        );
    }

    // PUT ACTUALIZAR POSICION DE NEUMATICO
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePosicionNeumatico(
        int id,
        [FromBody] UpdatePosicionNeumaticoDto posicionNeumaticoDto
    )
    {
        if (id <= 0)
        {
            return BadRequest("El id debe ser mayor a 0");
        }

        PosicionNeumatico posicionNeumatico = mapper.Map<PosicionNeumatico>(posicionNeumaticoDto);
        posicionNeumatico.IdPosicionNeumatico = id;

        try
        {
            await _servicePosicionNeumatico.UpdateAsync(id, posicionNeumaticoDto);
            await _serviceAuditoria.AddAsync(
                new CreateAuditoriaDto
                {
                    IdEntidad = id,
                    Entidad = NombreClases.PosicionNeumatico,
                    Accion = nameof(UpdatePosicionNeumatico),
                }
            );
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // DELETE POSICION DE NEUMATICO
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePosicionNeumatico(int id)
    {
        var deleted = await _servicePosicionNeumatico.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound();
        }
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = id,
                Entidad = NombreClases.PosicionNeumatico,
                Accion = nameof(DeletePosicionNeumatico),
            }
        );
        return NoContent();
    }
}
