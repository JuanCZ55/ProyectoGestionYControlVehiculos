using AutoMapper;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("api/mantenimiento")]
[ApiController]
[Authorize(Policy = "Everyone")]
public class ControllerService : ControllerBase
{
    private readonly ServiceService _serviceService;
    private readonly ServiceAuditoria _serviceAuditoria;
    private readonly IMapper mapper;

    public ControllerService(
        ServiceService serviceService,
        IMapper mapper,
        ServiceAuditoria serviceAuditoria
    )
    {
        _serviceService = serviceService;
        _serviceAuditoria = serviceAuditoria;
        this.mapper = mapper;
    }

    // GET TODOS LOS SERVICIOS
    [HttpGet]
    public async Task<IActionResult> GetAllServices(
        [FromQuery] int numeroPagina = 1,
        [FromQuery] int tamanoPagina = 10
    )
    {
        PagedResponse<Service> services = await _serviceService.GetAllAsync(
            numeroPagina,
            tamanoPagina
        );
        return Ok(services);
    }

    // GET SERVICIO POR ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetServiceById(int id)
    {
        var service = await _serviceService.GetByIdAsync(id);
        if (service == null)
        {
            return NotFound();
        }
        return Ok(service);
    }

    // POST NUEVO SERVICIO
    [HttpPost]
    public async Task<IActionResult> CreateService([FromBody] CreateServiceDto serviceDto)
    {
        Service service = mapper.Map<Service>(serviceDto);
        var newService = await _serviceService.AddAsync(service);
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = newService.IdService,
                Entidad = NombreClases.Service,
                Accion = nameof(CreateService),
            }
        );
        return CreatedAtAction(
            nameof(GetServiceById),
            new { id = newService.IdService },
            newService
        );
    }

    // PUT ACTUALIZAR SERVICIO
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateService(int id, [FromBody] UpdateServiceDto serviceDto)
    {
        if (id <= 0)
        {
            return BadRequest("El id debe ser mayor a 0");
        }
        Service service = mapper.Map<Service>(serviceDto);
        service.IdService = id;

        try
        {
            await _serviceService.UpdateAsync(id, serviceDto);
            await _serviceAuditoria.AddAsync(
                new CreateAuditoriaDto
                {
                    IdEntidad = id,
                    Entidad = NombreClases.Service,
                    Accion = nameof(UpdateService),
                }
            );
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // DELETE SERVICIO
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteService(int id)
    {
        var deleted = await _serviceService.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound();
        }
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = id,
                Entidad = NombreClases.Service,
                Accion = nameof(DeleteService),
            }
        );
        return NoContent();
    }

    // BAJA LOGICA SERVICIO
    [HttpPatch("baja/{id}")]
    public async Task<IActionResult> SoftDeleteService(int id)
    {
        var softDeleted = await _serviceService.SoftDeleteAsync(id);
        if (!softDeleted)
        {
            return NotFound();
        }
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = id,
                Entidad = NombreClases.Service,
                Accion = nameof(SoftDeleteService),
            }
        );
        return NoContent();
    }

    // ALTA LOGICA SERVICIO
    [HttpPatch("alta/{id}")]
    public async Task<IActionResult> RestoreService(int id)
    {
        var restored = await _serviceService.RestoreAsync(id);
        if (!restored)
        {
            return NotFound();
        }
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = id,
                Entidad = NombreClases.Service,
                Accion = nameof(RestoreService),
            }
        );
        return NoContent();
    }

    // GET SERVICIOS POR ID VEHICULO

    [HttpGet("vehiculo/{vehiculoId}")]
    public async Task<IActionResult> GetServicesByVehiculoId(
        int vehiculoId,
        [FromQuery] int nroPagina = 1,
        [FromQuery] int tamanoPagina = 10
    )
    {
        var servicesVehiculo = await _serviceService.GetServiceByVehicleId(
            vehiculoId,
            nroPagina,
            tamanoPagina
        );
        if (servicesVehiculo == null)
        {
            return NotFound("No se encontraron servicios para el vehiculo seleccionado.");
        }
        return Ok(servicesVehiculo);
    }

    [HttpPatch("servicio/resuelto/{id}")]
    public async Task<IActionResult> MarcarServicioResuelto(int id)
    {
        var marcado = await _serviceService.MarcarServicioResueltoAsync(id);
        if (!marcado)
        {
            return NotFound();
        }
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = id,
                Entidad = NombreClases.Service,
                Accion = nameof(MarcarServicioResuelto),
            }
        );
        return NoContent();
    }

    [HttpPatch("servicio/no/resuelto/{id}")]
    public async Task<IActionResult> MarcarServicioComoNoResuelto(int id)
    {
        var marcado = await _serviceService.MarcarServicioComoNoResueltoAsync(id);
        if (!marcado)
        {
            return NotFound();
        }
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = id,
                Entidad = NombreClases.Service,
                Accion = nameof(MarcarServicioComoNoResuelto),
            }
        );
        return NoContent();
    }
}
