using AutoMapper;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public enum typesOfRecord{
        Matafuego,
        Vehiculo
    }
    public class ServiceDocumento
    {
        private readonly AppDbContext _context;
        private readonly ServiceVehiculo _serviceVehiculo;
        private readonly IMapper mapper;

        public ServiceDocumento(
            AppDbContext context,
            IMapper mapper,
            ServiceVehiculo serviceVehiculo
        )
        {
            _context = context;
            this.mapper = mapper;
            _serviceVehiculo = serviceVehiculo;
        }

        // GET TODO DOCUMENTOS
        public async Task<PagedResponse<Documento>> GetAllAsync(int nroPagina, int tamanoPagina)
        {
            IQueryable<Documento> query = _context.Documentos;
            int totalRegistrosDocumento = await query.CountAsync();
            List<Documento>? documentos = await query
                .OrderBy(d => d.IdDocumento)
                .Skip((nroPagina - 1) * tamanoPagina)
                .Take(tamanoPagina)
                .ToListAsync();
            return new PagedResponse<Documento>(
                documentos,
                totalRegistrosDocumento,
                nroPagina,
                tamanoPagina
            );
        }

        // DOCUMENTO POR ID
        public async Task<Documento?> GetByIdAsync(int id)
        {
            return await _context.Documentos.FindAsync(id);
        }

        // NUEVO DOCUMENTO
        public async Task<Documento> AddAsync(
            Documento documento,
            string tipoEntidad,
            IFormFile archivo,
            string tipoDoc,
            string codigoEntidad
        )
        {
            string directorioGeneral = AppDomain.CurrentDomain.BaseDirectory;
            Console.WriteLine("Directorio General: " + directorioGeneral);
            string rutaBase = Path.Combine(
                directorioGeneral,
                "Nova-SLUG",
                "Documentos",
                tipoEntidad,
                codigoEntidad
            );
            {
                Directory.CreateDirectory(rutaBase);
            }
            int count = Directory.GetFiles(rutaBase).Length + 1;
            string extension = Path.GetExtension(archivo.FileName);
            string nombreArchivo = $"{tipoDoc}_{codigoEntidad}_{count}{extension}";
            string rutaCompleta = Path.Combine(rutaBase, nombreArchivo);

            using (var stream = new FileStream(rutaCompleta, FileMode.Create))
            {
                await archivo.CopyToAsync(stream);
            }

            documento.UrlArchivos = rutaCompleta.Replace("\\", "//");
            _context.Documentos.Add(documento);
            await _context.SaveChangesAsync();
            return documento;
        }

        // UPDATE DOCUMENTO
        public async Task UpdateAsync(int id, UpdateDocumentoDto documento)
        {
            Documento? docFinded = await this.GetByIdAsync(id);
            if (docFinded == null)
                throw new KeyNotFoundException("Documento con id " + id + " no encontrada");
            if (
                docFinded.IdVehiculo != documento.IdVehiculo
                && await _serviceVehiculo.GetByIdAsync(documento.IdVehiculo ?? 0) is null
            )
                throw new KeyNotFoundException(
                    "Vehiculo con id " + documento.IdVehiculo + " no encontrado"
                );
            mapper.Map(documento, docFinded);
            System.Console.WriteLine(docFinded.IdDocumento);
            await _context.SaveChangesAsync();
        }

        // ELIMINAR DOCUMENTO
        public async Task<bool> DeleteAsync(int id)
        {
            var documento = await _context.Documentos.FindAsync(id);
            if (documento == null)
                throw new KeyNotFoundException("No se encontro el documento con Id: " + id);
            string? rutaDelDocumento = documento.UrlArchivos;
            if (File.Exists(rutaDelDocumento))
            {
                File.Delete(rutaDelDocumento);
            }
            _context.Documentos.Remove(documento);
            return await _context.SaveChangesAsync() > 0;
        }

        // BAJA LOGICA DOCUMENTO
        public async Task<bool> SoftDeleteAsync(int id)
        {
            var documento = await _context.Documentos.FindAsync(id);
            if (documento == null)
                return false;

            documento.Estado = false;
            _context.Documentos.Update(documento);
            return await _context.SaveChangesAsync() > 0;
        }

        // ALTA LOGICA DOCUMENTO
        public async Task<bool> RestoreAsync(int id)
        {
            var documento = await _context.Documentos.FindAsync(id);
            if (documento == null)
                return false;

            documento.Estado = true;
            _context.Documentos.Update(documento);
            return await _context.SaveChangesAsync() > 0;
        }

        // GET DOCUMENTOS POR VEHICULO ID
        public async Task<List<Documento>> GetByVehiculoIdAsync(int IdVehiculo)
        {
            return await _context.Documentos.Where(d => d.IdVehiculo == IdVehiculo).ToListAsync();
        }

        public async Task<List<Documento>> GetByMatafuegoIdAsync(int idMatafuego)
        {
            return await _context.Documentos.Where(d => d.IdMatafuego == idMatafuego).ToListAsync();
        }

        public async Task<List<Documento>> GetDocumentosAsync(int idMatafuego)
        {
            return await _context.Documentos.Where(d => d.IdMatafuego == idMatafuego).ToListAsync();
        }

        //ESTOS METODOS SON PARA LA CREACION DE LAS RUTAS DE ALMACENAMIENTO Y NOMBRES DE ARCHIVOS
        public async Task<string?> GetPatenteByVehiculoId(int? idVehiculo)
        {
            if (idVehiculo == null)
                return null;
            var vehiculo = await _context.Vehiculos.FindAsync(idVehiculo);
            return vehiculo?.Patente;
        }

        public async Task<string?> GetNumeroSerieByMatafuegoId(int? idMatafuego)
        {
            if (idMatafuego == null)
                return null;
            var matafuego = await _context.Matafuegos.FindAsync(idMatafuego);
            return matafuego?.IdMatafuego.ToString();
        }

        // ENDPOINT PARA BUSCAR EL ARCHIVO DE UN DOCUMENTO Y ABRIRLO EN EL NAVEGADOR
        public async Task<FileStream?> GetFileStreamByDocumentoId(int idDocumento)
        {
            var documento = await _context.Documentos.FindAsync(idDocumento);
            if (documento == null || string.IsNullOrEmpty(documento.UrlArchivos))
            {
                return null;
            }

            string filePath = documento.UrlArchivos.Replace("/", "\\");
            if (!File.Exists(filePath))
            {
                return null;
            }

            return new FileStream(filePath, FileMode.Open, FileAccess.Read);
        }

        // AL DE CREACION HAY Q COLOCARLE LA LOGICA DE CREACION DE CARPETAS Y RENOMBRAMIENTO DE ARCHIVOS Y LA CREACION DEL URLPATH
        public async Task<bool> ValidateNotDocumentsOnDelete(int idRecord, typesOfRecord type)
        {
            if(type == typesOfRecord.Matafuego)
            {
                return await _context.Documentos.FirstOrDefaultAsync(m => m.IdMatafuego == idRecord) != null;
            }
            else
            {
                return await _context.Documentos.FirstOrDefaultAsync(v => v.IdVehiculo == idRecord) != null;
            }
        }
    }
}
