using AutoMapper;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("api/vehiculos")]
[ApiController]
[Authorize(Policy = "Everyone")]
public class ControllerVehiculo : ControllerBase
{
    private readonly ServiceVehiculo _serviceVehiculo;
    private readonly ServiceAuditoria _serviceAuditoria;
    private readonly IMapper mapper;

    public ControllerVehiculo(
        ServiceVehiculo serviceVehiculo,
        IMapper mapper,
        ServiceAuditoria serviceAuditoria
    )
    {
        _serviceVehiculo = serviceVehiculo;
        _serviceAuditoria = serviceAuditoria;
        this.mapper = mapper;
    }

    // GET TODOS LOS VEHICULOS
    [HttpGet]
    public async Task<IActionResult> GetAllVehiculos(
        [FromQuery] int nroPagina = 1,
        [FromQuery] int tamanoPagina = 10,
        [FromQuery] bool? estado = null
    )
    {
        PagedResponse<VehiculoDto> vehiculos = await _serviceVehiculo.GetAllAsync(
            nroPagina,
            tamanoPagina,
            estado
        );
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = null,
                Entidad = NombreClases.Vehiculo,
                Accion = AccionAuditoria.Select,
            }
        );
        return Ok(vehiculos);
    }

    // GET VEHICULO POR ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetVehiculoById(int id)
    {
        var vehiculo = await _serviceVehiculo.GetByIdAsync(id);
        if (vehiculo == null)
        {
            return NotFound();
        }
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = id,
                Entidad = NombreClases.Vehiculo,
                Accion = AccionAuditoria.Select,
            }
        );
        return Ok(vehiculo);
    }

    // POST NUEVO VEHICULO
    [HttpPost]
    public async Task<IActionResult> CreateVehiculo([FromBody] CreateVehiculoDto vehiculoDto)
    {
        Vehiculo vehiculo = mapper.Map<Vehiculo>(vehiculoDto);
        try
        {
            var newVehiculo = await _serviceVehiculo.AddAsync(vehiculo);
            await _serviceAuditoria.AddAsync(
                new CreateAuditoriaDto
                {
                    IdEntidad = newVehiculo.IdVehiculo,
                    Entidad = NombreClases.Vehiculo,
                    Accion = AccionAuditoria.Create,
                }
            );
            return CreatedAtAction(
                nameof(GetVehiculoById),
                new { id = newVehiculo.IdVehiculo },
                newVehiculo
            );
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    // PUT ACTUALIZAR VEHICULO
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateVehiculo(
        int id,
        [FromBody] UpdateVehiculoDto vehiculoDto
    )
    {
        if (id <= 0)
        {
            return BadRequest("El id debe ser mayor a 0");
        }

        Vehiculo vehiculo = mapper.Map<Vehiculo>(vehiculoDto);
        vehiculo.IdVehiculo = id;
        try
        {
            await _serviceVehiculo.UpdateAsync(id, vehiculoDto);
            await _serviceAuditoria.AddAsync(
                new CreateAuditoriaDto
                {
                    IdEntidad = id,
                    Entidad = NombreClases.Vehiculo,
                    Accion = AccionAuditoria.Update,
                }
            );
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    // DELETE VEHICULO
    [Authorize(Policy = "RequireAdmin")]
    [HttpDelete("{id}")]
    
    public async Task<IActionResult> DeleteVehiculo(int id)
    {
        try
        {
            var deleted = await _serviceVehiculo.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound("No se elimino el registro");
            }
            await _serviceAuditoria.AddAsync(
                new CreateAuditoriaDto
                {
                    IdEntidad = id,
                    Entidad = NombreClases.Vehiculo,
                    Accion = AccionAuditoria.Delete,
                }
            );
            return NoContent();
        }
        catch(InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        
    }

    // BAJA LOGICA VEHICULO
    [HttpPatch("baja/{id}")]
    public async Task<IActionResult> SoftDeleteVehiculo(int id)
    {
        var softDeleted = await _serviceVehiculo.SoftDeleteAsync(id);
        if (!softDeleted)
        {
            return NotFound();
        }
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = id,
                Entidad = NombreClases.Vehiculo,
                Accion = AccionAuditoria.SoftDelete,
            }
        );
        return NoContent();
    }

    // ALTA LOGICA VEHICULO
    [HttpPatch("alta/{id}")]
    public async Task<IActionResult> RestoreVehiculo(int id)
    {
        var restored = await _serviceVehiculo.RestoreAsync(id);
        if (!restored)
        {
            return NotFound();
        }
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = id,
                Entidad = NombreClases.Vehiculo,
                Accion = AccionAuditoria.SoftRestore,
            }
        );
        return NoContent();
    }

    //BUSCAR VEHICULO POR PATENTE
    [HttpGet("buscarPorPatente/{patente}")]
    public async Task<IActionResult> GetVehiculoByPatente(string patente)
    {
        var vehiculo = await _serviceVehiculo.GetByPatenteAsync(patente);
        if (vehiculo == null)
        {
            return NotFound();
        }
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = vehiculo.IdVehiculo,
                Entidad = NombreClases.Vehiculo,
                Accion = AccionAuditoria.Select,
            }
        );
        return Ok(vehiculo);
    }

    //BUSCAR VEHICULO POR PATENTE LIKE
    [HttpGet("buscarPorPatenteLike/{patente}")]
    public async Task<IActionResult> GetVehiculoByPatenteLike(string patente)
    {
        var vehiculos = await _serviceVehiculo.GetByPatenteLikeAsync(patente);
        if (vehiculos == null || vehiculos.Count == 0)
        {
            return NotFound();
        }
        return Ok(vehiculos);
    }

    [HttpPut("asignarMatafuego/{idVehiculo}/{idMatafuego}")]
    public async Task<IActionResult> AsignarMatafuegoAVehiculo(int idVehiculo, int idMatafuego)
    {
        try
        {
            await _serviceVehiculo.AsignarMatafuegoAVehiculo(idMatafuego, idVehiculo);
            await _serviceAuditoria.AddAsync(
                new CreateAuditoriaDto
                {
                    IdEntidad = idVehiculo,
                    Entidad = NombreClases.Vehiculo,
                    Accion = AccionAuditoria.Update,
                }
            );
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
}
