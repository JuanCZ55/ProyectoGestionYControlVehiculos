using AutoMapper;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("api/neumaticos")]
[ApiController]
[Authorize(Policy = "Everyone")]
public class ControllerNeumatico : ControllerBase
{
    private readonly ServiceNeumatico _serviceNeumatico;
    private readonly IMapper mapper;
    private readonly ServiceAuditoria _serviceAuditoria;

    public ControllerNeumatico(
        ServiceNeumatico serviceNeumatico,
        IMapper mapper,
        ServiceAuditoria serviceAuditoria
    )
    {
        _serviceNeumatico = serviceNeumatico;
        _serviceAuditoria = serviceAuditoria;
        this.mapper = mapper;
    }

    // GET TODOS LOS NEUMATICOS
    [HttpGet]
    public async Task<IActionResult> GetAllNeumaticos(
        [FromQuery] int numeroPagina = 1,
        [FromQuery] int tamanoPagina = 10
    )
    {
        PagedResponse<Neumatico> neumaticos = await _serviceNeumatico.GetAllAsync(
            numeroPagina,
            tamanoPagina
        );
        return Ok(neumaticos);
    }

    // GET NEUMATICO POR ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetNeumaticoById(int id)
    {
        var neumatico = await _serviceNeumatico.GetByIdAsync(id);
        if (neumatico == null)
        {
            return NotFound();
        }
        return Ok(neumatico);
    }

    [HttpGet("getAllNotAssigned")]
    public async Task<IActionResult> GetAllNotAssigned(
        [FromQuery] int numeroPagina = 1,
        [FromQuery] int tamanoPagina = 10
    )
    {
        Console.WriteLine("============\nnumeroPagina: " + numeroPagina);
        var neumaticos = await _serviceNeumatico.GetAllNotAssignedAsync(numeroPagina, tamanoPagina);
        return Ok(neumaticos);
    }

    [HttpGet("getAllAssignedTo")]
    public async Task<IActionResult> GetAllAssignedTo(
        int idVehiculo,
        [FromQuery] int numeroPagina = 1,
        [FromQuery] int tamanoPagina = 10
    )
    {
        Console.WriteLine("numeroPagina: " + numeroPagina);
        var neumaticos = await _serviceNeumatico.GetAllAssignedToAsync(
            idVehiculo,
            numeroPagina,
            tamanoPagina
        );
        return Ok(neumaticos);
    }

    // POST NUEVO NEUMATICO
    [HttpPost]
    public async Task<IActionResult> AddNeumatico([FromBody] CreateNeumaticoDto NeumaticoDto)
    {
        System.Console.WriteLine("hola");
        Neumatico neumatico = mapper.Map<Neumatico>(NeumaticoDto);
        if (NeumaticoDto == null)
            neumatico.FechaColocacion = null;

        var newNeumatico = await _serviceNeumatico.AddAsync(neumatico);
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = newNeumatico.IdNeumatico,
                Entidad = NombreClases.Neumatico,
                Accion = nameof(AddNeumatico),
            }
        );
        return CreatedAtAction(
            nameof(GetNeumaticoById),
            new { id = newNeumatico.IdNeumatico },
            newNeumatico
        );
    }

    [HttpPut("asignar/neumatico/{idVehiculo}/a/{idNeumatico}")]
    public async Task<IActionResult> AsignarNeumatico(int idVehiculo, int idNeumatico)
    {
        try
        {
            var result = await _serviceNeumatico.AsignarNeumaticoAsync(idVehiculo, idNeumatico);
            if (!result)
            {
                return BadRequest("No se pudo asignar el neumatico");
            }
            await _serviceAuditoria.AddAsync(
                new CreateAuditoriaDto
                {
                    IdEntidad = idNeumatico,
                    Entidad = NombreClases.Neumatico,
                    Accion = nameof(AsignarNeumatico),
                }
            );
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPut("borrar/asignacion/{idNeumatico}")]
    public async Task<IActionResult> BorrarAsignacion(int idNeumatico)
    {
        try
        {
            var result = await _serviceNeumatico.BorrarAsignacionAsync(idNeumatico);
            if (!result)
            {
                return BadRequest("No se pudo borrar la asignacion");
            }
            await _serviceAuditoria.AddAsync(
                new CreateAuditoriaDto
                {
                    IdEntidad = idNeumatico,
                    Entidad = NombreClases.Neumatico,
                    Accion = nameof(BorrarAsignacion),
                }
            );
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // PUT ACTUALIZAR NEUMATICO
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateNeumatico(
        int id,
        [FromBody] UpdateNeumaticoDto neumaticoDto
    )
    {
        if (id <= 0)
        {
            return BadRequest("El id debe ser mayor a 0");
        }

        Neumatico neumatico = mapper.Map<Neumatico>(neumaticoDto);
        neumatico.IdNeumatico = id;
        try
        {
            await _serviceNeumatico.UpdateAsync(id, neumaticoDto);
            await _serviceAuditoria.AddAsync(
                new CreateAuditoriaDto
                {
                    IdEntidad = id,
                    Entidad = NombreClases.Neumatico,
                    Accion = nameof(UpdateNeumatico),
                }
            );
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // DELETE NEUMATICO
    [Authorize(Policy = "RequireAdmin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNeumatico(int id)
    {
        var deleted = await _serviceNeumatico.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound();
        }
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = id,
                Entidad = NombreClases.Neumatico,
                Accion = nameof(DeleteNeumatico),
            }
        );
        return NoContent();
    }

    // BAJA LOGICA NEUMATICO
    [HttpPatch("baja/{id}")]
    public async Task<IActionResult> SoftDeleteNeumatico(int id)
    {
        var result = await _serviceNeumatico.SoftDeleteAsync(id);
        if (!result)
        {
            return NotFound();
        }
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = id,
                Entidad = NombreClases.Neumatico,
                Accion = nameof(SoftDeleteNeumatico),
            }
        );
        return NoContent();
    }

    // ALTA LOGICA NEUMATICO
    [HttpPatch("alta/{id}")]
    public async Task<IActionResult> RestoreNeumatico(int id)
    {
        var result = await _serviceNeumatico.RestoreAsync(id);
        if (!result)
        {
            return NotFound();
        }
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = id,
                Entidad = NombreClases.Neumatico,
                Accion = nameof(RestoreNeumatico),
            }
        );
        return NoContent();
    }
}
