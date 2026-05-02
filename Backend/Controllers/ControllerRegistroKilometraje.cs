using AutoMapper;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("api/registro-kilometraje")]
[ApiController]
[Authorize(Policy = "Everyone")]
public class ControllerRegistroKilometraje : ControllerBase
{
    private readonly ServiceRegistroKilometraje _serviceRegistroKilometraje;
    private readonly ServiceVehiculo _serviceVehiculo;
    private readonly ServiceAuditoria _serviceAuditoria;
    private readonly IMapper mapper;

    public ControllerRegistroKilometraje(
        ServiceRegistroKilometraje serviceRegistroKilometraje,
        ServiceVehiculo serviceVehiculo,
        ServiceAuditoria serviceAuditoria,
        IMapper mapper
    )
    {
        _serviceRegistroKilometraje = serviceRegistroKilometraje;
        _serviceVehiculo = serviceVehiculo;
        _serviceAuditoria = serviceAuditoria;
        this.mapper = mapper;
    }

    // GET TODO REGISTROS KILOMETRAJE <-NO CREO Q SE USE MUCHO, EN REALIDAD NO SE USA
    /*[HttpGet]
    public async Task<IActionResult> GetAllRegistrosKilometraje(
        [FromQuery] int numeroPagina = 1,
        [FromQuery] int tamanoPagina = 10
    )
    {
        PagedResponse<RegistroKilometraje>? registros =
            await _serviceRegistroKilometraje.GetAllAsync(numeroPagina, tamanoPagina);
        return Ok(registros);
    }*/

    // GET REGISTRO KILOMETRAJE POR ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetRegistroKilometrajeById(int id)
    {
        var registro = await _serviceRegistroKilometraje.GetByIdAsync(id);
        if (registro == null)
        {
            return NotFound();
        }
        return Ok(registro);
    }

    [HttpGet("latest/{idVehiculo}")]
    public async Task<IActionResult> GetLatestRegistroKilometrajeByVehiculoId(int idVehiculo)
    {
        if (idVehiculo <= 0)
        {
            return BadRequest("El id debe ser mayor a 0");
        }
        RegistroKilometraje? registroFinded =
            await _serviceRegistroKilometraje.GetLatestRegistroKilometrajeByVehiculoIdAsync(
                idVehiculo
            );
        if (registroFinded == null)
        {
            return NotFound("El vehiculo no tiene registros de kilometraje registrados.");
        }
        return Ok(registroFinded);
    }

    // POST NUEVO REGISTRO KILOMETRAJE
    [HttpPost]
    public async Task<IActionResult> AddRegistroKilometraje(
        [FromBody] CreateRegistroKilometrajeDto createDto
    )
    {
        RegistroKilometraje registroKilometraje = mapper.Map<RegistroKilometraje>(createDto);

        try
        {
            var newRegistro = await _serviceRegistroKilometraje.AddAsync(registroKilometraje);
            await _serviceAuditoria.AddAsync(
                new CreateAuditoriaDto
                {
                    IdEntidad = newRegistro.IdRegistroKilometraje,
                    Entidad = NombreClases.RegistroKilometraje,
                    Accion = nameof(AddRegistroKilometraje),
                }
            );
            return CreatedAtAction(
                nameof(GetRegistroKilometrajeById),
                new { id = newRegistro.IdRegistroKilometraje },
                new
                {
                    IdRegistroKilometraje = newRegistro.IdRegistroKilometraje,
                    Kilometraje = newRegistro.Kilometraje,
                    FechaRegistro = newRegistro.FechaRegistro,
                    Estado = newRegistro.Estado,
                    IdVehiculo = newRegistro.IdVehiculo,
                }
            );
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

    // PUT ACTUALIZAR REGISTRO KILOMETRAJE
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRegistroKilometraje(
        int id,
        [FromBody] UpdateRegistroKilometrajeDto updateRegistroDto
    )
    {
        if (id <= 0)
        {
            return BadRequest("El id debe ser mayor a 0");
        }

        RegistroKilometraje registroKilometraje = mapper.Map<RegistroKilometraje>(
            updateRegistroDto
        );
        registroKilometraje.IdRegistroKilometraje = id;

        try
        {
            await _serviceRegistroKilometraje.UpdateAsync(id, updateRegistroDto);
            await _serviceAuditoria.AddAsync(
                new CreateAuditoriaDto
                {
                    IdEntidad = id,
                    Entidad = NombreClases.RegistroKilometraje,
                    Accion = nameof(UpdateRegistroKilometraje),
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

    // DELETE REGISTRO KILOMETRAJE
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRegistroKilometraje(int id)
    {
        var deleted = await _serviceRegistroKilometraje.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound();
        }
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = id,
                Entidad = NombreClases.RegistroKilometraje,
                Accion = nameof(DeleteRegistroKilometraje),
            }
        );
        return NoContent();
    }

    // BAJA LOGICA REGISTRO KILOMETRAJE
    [HttpPatch("baja/{id}")]
    public async Task<IActionResult> SoftDeleteRegistroKilometraje(int id)
    {
        var softDeleted = await _serviceRegistroKilometraje.SoftDeleteAsync(id);
        if (!softDeleted)
        {
            return NotFound();
        }
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = id,
                Entidad = NombreClases.RegistroKilometraje,
                Accion = nameof(SoftDeleteRegistroKilometraje),
            }
        );
        return NoContent();
    }

    // ALTA LOGICA REGISTRO KILOMETRAJE
    [HttpPatch("alta/{id}")]
    public async Task<IActionResult> RestoreRegistroKilometraje(int id)
    {
        var restored = await _serviceRegistroKilometraje.RestoreAsync(id);
        if (!restored)
        {
            return NotFound();
        }
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = id,
                Entidad = NombreClases.RegistroKilometraje,
                Accion = nameof(RestoreRegistroKilometraje),
            }
        );
        return NoContent();
    }

    //ESTE METODO BUSCA EL VEHICULO POR LA PATENTE Y DEVUELVE SUS REGISTROS DE KILOMETRAJE A PARTIR DE SU ID
    [HttpGet("listado/{patente}")]
    public async Task<IActionResult> GetRegistrosPorPatente(
        string patente,
        [FromQuery] int nroPagina = 1,
        [FromQuery] int tamanoPagina = 10
    )
    {
        Vehiculo? vehiculo = await _serviceVehiculo.GetByPatenteAsync(patente);

        if (vehiculo == null)
        {
            return NotFound("No se encontró ningún vehículo con la patente proporcionada.");
        }
        PagedResponse<RegistroKilometraje> registrosKilometraje =
            await _serviceRegistroKilometraje.GetByVehiculoIdAsync(
                vehiculo.IdVehiculo,
                nroPagina,
                tamanoPagina
            );
        var result = registrosKilometraje.Items.Select(r => new
        {
            r.IdRegistroKilometraje,
            r.IdVehiculo,
            r.Kilometraje,
            r.FechaRegistro,
            r.Estado,
            Marca = vehiculo.Marca,
            Modelo = vehiculo.Modelo,
            Patente = vehiculo.Patente,
            nroPagina = registrosKilometraje.PaginaActual,
            totalPaginasCalculadas = registrosKilometraje.TotalPaginasCalculadas,
        });
        return Ok(result);
    }

    // ACA DEBERIAMOS TENER UN METODO Q BUSQUE REGISTRO POR PATENTE O SIMILAR
    // TAMBIEN UN METODO Q AÑADA KILOMETRAJE A LAS GOMAS QUE LLEVA EL VEHICULO
}
