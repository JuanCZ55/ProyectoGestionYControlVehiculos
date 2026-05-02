using AutoMapper;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("api/documentos")]
[ApiController]
[Authorize(Policy = "Everyone")]
public class ControllerDocumento : ControllerBase
{
    private readonly ServiceDocumento _serviceDocumento;
    private readonly ServiceAuditoria _serviceAuditoria;
    private readonly IMapper mapper;

    public ControllerDocumento(
        ServiceDocumento serviceDocumento,
        IMapper mapper,
        ServiceAuditoria serviceAuditoria
    )
    {
        _serviceDocumento = serviceDocumento;
        _serviceAuditoria = serviceAuditoria;
        this.mapper = mapper;
    }

    // GET TODOS LOS DOCUMENTOS
    [HttpGet]
    public async Task<IActionResult> GetAllDocumentos(
        [FromQuery] int numeroPagina = 1,
        [FromQuery] int tamanoPagina = 10
    )
    {
        PagedResponse<Documento> documentos = await _serviceDocumento.GetAllAsync(
            numeroPagina,
            tamanoPagina
        );
        return Ok(documentos);
    }

    // GET DOCUMENTO POR ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetDocumentoById(int id)
    {
        var documento = await _serviceDocumento.GetByIdAsync(id);
        if (documento == null)
        {
            return NotFound();
        }
        return Ok(documento);
    }

    // POST NUEVO DOCUMENTO
    [HttpPost]
    public async Task<IActionResult> AddDocumento([FromForm] CreateDocumentoDto dto)
    {
        if (dto.Archivo == null || dto.Archivo.Length == 0)
            return BadRequest("Debe adjuntar un archivo.");

        Documento documento = mapper.Map<Documento>(dto);

        // Determinar tipoEntidad y codigoEntidad
        string tipoEntidad,
            codigoEntidad;
        if (documento.IdVehiculo != null)
        {
            tipoEntidad = "Vehiculos";
            codigoEntidad =
                await _serviceDocumento.GetPatenteByVehiculoId(documento.IdVehiculo)
                ?? "Desconocido";
        }
        else if (documento.IdMatafuego != null)
        {
            tipoEntidad = "Matafuegos";
            codigoEntidad =
                await _serviceDocumento.GetNumeroSerieByMatafuegoId(documento.IdMatafuego)
                ?? "Desconocido";
        }
        else
        {
            return BadRequest("Debe asociar el documento a un vehículo o matafuego.");
        }

        string tipoDoc = documento.Tipo ?? "Otro";

        var newDocumento = await _serviceDocumento.AddAsync(
            documento,
            tipoEntidad,
            dto.Archivo,
            tipoDoc,
            codigoEntidad
        );
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = newDocumento.IdDocumento,
                Entidad = NombreClases.Documento,
                Accion = nameof(AddDocumento),
            }
        );
        return CreatedAtAction(
            nameof(GetDocumentoById),
            new { id = newDocumento.IdDocumento },
            newDocumento
        );
    }

    // PUT ACTUALIZAR DOCUMENTO
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDocumento(
        int id,
        [FromBody] UpdateDocumentoDto documentoDto
    )
    {
        if (id <= 0)
        {
            return BadRequest("El id debe ser mayor a 0");
        }

        try
        {
            await _serviceDocumento.UpdateAsync(id, documentoDto);
            await _serviceAuditoria.AddAsync(
                new CreateAuditoriaDto
                {
                    IdEntidad = id,
                    Entidad = NombreClases.Documento,
                    Accion = nameof(UpdateDocumento),
                }
            );
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // DELETE DOCUMENTO
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDocumento(int id)
    {
        try
        {
            bool deleted = await _serviceDocumento.DeleteAsync(id);
            await _serviceAuditoria.AddAsync(
                new CreateAuditoriaDto
                {
                    IdEntidad = id,
                    Entidad = NombreClases.Documento,
                    Accion = nameof(DeleteDocumento),
                }
            );
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    // BAJA LOGICA DOCUMENTO
    [HttpPatch("baja/{id}")]
    public async Task<IActionResult> SoftDeleteDocumento(int id)
    {
        var result = await _serviceDocumento.SoftDeleteAsync(id);
        if (!result)
        {
            return NotFound("Documento no actualizado con id: " + id);
        }
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = id,
                Entidad = NombreClases.Documento,
                Accion = nameof(SoftDeleteDocumento),
            }
        );
        return NoContent();
    }

    // ALTA LOGICA DOCUMENTO
    [HttpPatch("alta/{id}")]
    public async Task<IActionResult> RestoreDocumento(int id)
    {
        var result = await _serviceDocumento.RestoreAsync(id);
        if (!result)
        {
            return NotFound("Documento no actualizado con id: " + id);
        }
        await _serviceAuditoria.AddAsync(
            new CreateAuditoriaDto
            {
                IdEntidad = id,
                Entidad = NombreClases.Documento,
                Accion = nameof(RestoreDocumento),
            }
        );
        return NoContent();
    }

    // GET DOCUMENTOS POR VEHICULO ID
    [HttpGet("vehiculo/{IdVehiculo}")]
    public async Task<IActionResult> GetDocumentosByVehiculoId(int IdVehiculo)
    {
        var documentos = await _serviceDocumento.GetByVehiculoIdAsync(IdVehiculo);
        return Ok(documentos);
    }

    [HttpGet("matafuego/{idMatafuego}")]
    public async Task<IActionResult> GetDocumentosByMatafuegoId(int idMatafuego)
    {
        var documentos = await _serviceDocumento.GetByMatafuegoIdAsync(idMatafuego);
        return Ok(documentos);
    }

    // GET ARCHIVO POR DOCUMENTO ID
    [HttpGet("archivo/{id}")]
    public async Task<IActionResult> GetArchivoByDocumentoId(int id)
    {
        var archivo = await _serviceDocumento.GetFileStreamByDocumentoId(id);
        var documento = await _serviceDocumento.GetByIdAsync(id);

        if (archivo == null || documento == null)
        {
            return NotFound("Archivo no encontrado para el documento con id: " + id);
        }

        // Obtener la extensión del archivo
        var extension = Path.GetExtension(documento.UrlArchivos)?.ToLower();

        // Determinar el tipo de archivo según la extensión
        string mimeType = extension switch
        {
            ".pdf" => "application/pdf",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xls" => "application/vnd.ms-excel",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            _ => "application/octet-stream",
        };

        // Usar el nombre real del archivo, si no, "archivo"
        var nombreArchivo = Path.GetFileName(documento.UrlArchivos) ?? "archivo";

        return File(archivo, mimeType, nombreArchivo);
    }
    // HAY Q VER COMO APLICAR LO DE LOS PATHS Y LO DE ARCHIVOS ACA
}
