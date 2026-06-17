using AutoMapper;
using Backend.Models;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class ServiceRegistroKilometraje
    {
        private readonly AppDbContext _context;
        private readonly ServiceVehiculo _serviceVehiculo;
        private readonly IMapper mapper;

        public ServiceRegistroKilometraje(
            AppDbContext context,
            IMapper mapper,
            ServiceVehiculo serviceVehiculo
        )
        {
            _context = context;
            this.mapper = mapper;
            _serviceVehiculo = serviceVehiculo;
        }

        // GET TODO REGISTROS KILOMETRAJE
        public async Task<PagedResponse<RegistroKilometraje>> GetAllAsync(
            int nroPagina,
            int tamanoPagina
        )
        {
            IQueryable<RegistroKilometraje> query = _context.RegistrosKilometraje;
            int totalRegistrosRegistroKilometraje = await query.CountAsync();
            List<RegistroKilometraje>? registrosKilometraje = await query
                .OrderBy(r => r.IdRegistroKilometraje)
                .Skip((nroPagina - 1) * tamanoPagina)
                .Take(tamanoPagina)
                .ToListAsync();
            return new PagedResponse<RegistroKilometraje>(
                registrosKilometraje,
                totalRegistrosRegistroKilometraje,
                nroPagina,
                tamanoPagina
            );
        }

        public async Task<List<RegistroKilometraje>> ObtenerRegistrosAsync(
            bool misRegistros,
            bool estado,
            int idUsuarioActual,
            int idVehiculo
        )
        {
            var queryAud = _context.Auditorias.Where(a => a.Entidad == NombreClases.RegistroKilometraje && a.Accion == AccionAuditoria.Create);

            if (misRegistros)
                queryAud = queryAud.Where(a => a.IdUsuario == idUsuarioActual);

            var idAudsPermitidos = queryAud.Select(a => a.IdEntidad).Distinct();

            return await _context.RegistrosKilometraje
                .Take(30)
                .OrderByDescending(r => r.FechaRegistro)
                .Where(c => c.Estado == estado && c.IdVehiculo == idVehiculo && idAudsPermitidos.Contains(c.IdRegistroKilometraje))
                .Select(c => new RegistroKilometraje
                {
                    IdRegistroKilometraje = c.IdRegistroKilometraje,
                    IdVehiculo = c.IdVehiculo,
                    Kilometraje = c.Kilometraje,
                    FechaRegistro = c.FechaRegistro,
                    Estado = c.Estado,
                    currentUser = _context.Auditorias.Any(a => a.IdUsuario == idUsuarioActual && a.Entidad == NombreClases.RegistroKilometraje && a.Accion == AccionAuditoria.Create && a.IdEntidad == c.IdRegistroKilometraje)
                })
                .ToListAsync();
        }

        // REGISTRO KILOMETRAJE POR ID
        public async Task<RegistroKilometraje?> GetByIdAsync(int id)
        {
            return await _context.RegistrosKilometraje.FindAsync(id);
        }

        public async Task<RegistroKilometraje?> GetLatestRegistroKilometrajeByVehiculoIdAsync(
            int idVehiculo
        )
        {
            var prueba = await _context
                .RegistrosKilometraje.OrderByDescending(register => register.FechaRegistro)
                .FirstOrDefaultAsync(r => r.IdVehiculo == idVehiculo);
            Console.WriteLine(prueba);
            return prueba;
        }

        public async Task<RegistroKilometraje?> GetLatestRegistroKilometrajeVehiculoIdAndNotSameAsync(
            int idVehiculo,
            int IdRegistroKilometraje
        )
        {
            return await _context
                .RegistrosKilometraje.OrderByDescending(register => register.FechaRegistro)
                .Where(vehiculo => vehiculo.IdRegistroKilometraje != IdRegistroKilometraje)
                .FirstOrDefaultAsync(r => r.IdVehiculo == idVehiculo);
        }

        // NUEVO REGISTRO KILOMETRAJE
        public async Task<RegistroKilometraje> AddAsync(RegistroKilometraje registroKilometraje)
        {
            if (await _serviceVehiculo.GetByIdAsync(registroKilometraje.IdVehiculo) is null)
                throw new KeyNotFoundException(
                    "Vehiculo con id " + registroKilometraje.IdVehiculo + " no encontrado"
                );
            if (
                await _serviceVehiculo.GetByIdAsync(registroKilometraje.IdVehiculo) is Vehiculo veh
                && !veh.Estado
            )
                throw new InvalidOperationException("El vehiculo esta dado de baja");
            RegistroKilometraje? ultimoRegistroDeKilometraje =
                await GetLatestRegistroKilometrajeByVehiculoIdAsync(registroKilometraje.IdVehiculo);
            if (
                ultimoRegistroDeKilometraje != null
                && DateOnly.FromDateTime(DateTime.Now)
                    == DateOnly.FromDateTime(ultimoRegistroDeKilometraje.FechaRegistro)
            )
            {
                throw new InvalidOperationException(
                    "No se puede agregar mas de un registro por dia"
                );
            }
            if (
                ultimoRegistroDeKilometraje != null
                && registroKilometraje.Kilometraje <= ultimoRegistroDeKilometraje.Kilometraje
            )
            {
                throw new InvalidOperationException("El registro no puede ser menor al anterior");
            }

            _context.RegistrosKilometraje.Add(registroKilometraje);
            await _context.SaveChangesAsync();
            return registroKilometraje;
        }

        // UPDATE REGISTRO KILOMETRAJE
        public async Task UpdateAsync(int id, UpdateRegistroKilometrajeDto registroKilometrajeDto)
        {
            RegistroKilometraje? registroFinded = await _context.RegistrosKilometraje.FindAsync(id);
            if (registroFinded == null)
                throw new KeyNotFoundException(
                    "Registro Kilometraje con id " + id + " no encontrado"
                );
            if (
                registroFinded.IdVehiculo != registroKilometrajeDto.IdVehiculo
                && await _serviceVehiculo.GetByIdAsync(registroKilometrajeDto.IdVehiculo) is null
            )
                throw new KeyNotFoundException(
                    "Vehiculo con id " + registroKilometrajeDto.IdVehiculo + " no encontrado"
                );
            if (
                await GetLatestRegistroKilometrajeVehiculoIdAndNotSameAsync(
                    registroKilometrajeDto.IdVehiculo,
                    id
                )
                    is (RegistroKilometraje registroLatestNotVehiculo)
                && registroKilometrajeDto.Kilometraje <= registroLatestNotVehiculo.Kilometraje
            )
            {
                throw new InvalidOperationException(
                    "El registro no puede ser menor al anterior de otro vehiculo"
                );
            }
            mapper.Map(registroKilometrajeDto, registroFinded);
            await _context.SaveChangesAsync();
        }

        // ELIMINAR REGISTRO KILOMETRAJE
        public async Task<bool> DeleteAsync(int id)
        {
            var registroKilometraje = await _context.RegistrosKilometraje.FindAsync(id);
            if (registroKilometraje == null)
                return false;

            _context.RegistrosKilometraje.Remove(registroKilometraje);
            return await _context.SaveChangesAsync() > 0;
        }

        // BAJA LOGICA REGISTRO KILOMETRAJE
        public async Task<bool> SoftDeleteAsync(int id)
        {
            var registroKilometraje = await _context.RegistrosKilometraje.FindAsync(id);
            if (registroKilometraje == null)
                return false;

            registroKilometraje.Estado = false;
            _context.RegistrosKilometraje.Update(registroKilometraje);
            return await _context.SaveChangesAsync() > 0;
        }

        // ALTA LOGICA REGISTRO KILOMETRAJE
        public async Task<bool> RestoreAsync(int id)
        {
            var registroKilometraje = await _context.RegistrosKilometraje.FindAsync(id);
            if (registroKilometraje == null)
                return false;

            registroKilometraje.Estado = true;
            _context.RegistrosKilometraje.Update(registroKilometraje);
            return await _context.SaveChangesAsync() > 0;
        }

        // GET REGISTROS KILOMETRAJE POR VEHICULO ID
        public async Task<PagedResponse<RegistroKilometraje>> GetByVehiculoIdAsync(
            int IdVehiculo,
            int nroPagina,
            int tamanoPagina
        )
        {
            IQueryable<RegistroKilometraje> query = _context.RegistrosKilometraje;
            int totalRegistrosRegistroKilometraje = await query
                .Where(r => r.IdVehiculo == IdVehiculo)
                .CountAsync();
            List<RegistroKilometraje>? registrosKilometraje = await query
                .Where(r => r.IdVehiculo == IdVehiculo)
                .OrderByDescending(r => r.IdRegistroKilometraje)
                .Skip((nroPagina - 1) * tamanoPagina)
                .Take(tamanoPagina)
                .ToListAsync();
            PagedResponse<RegistroKilometraje> pagedResponse =
                new PagedResponse<RegistroKilometraje>(
                    registrosKilometraje,
                    totalRegistrosRegistroKilometraje,
                    nroPagina,
                    tamanoPagina
                );
            return pagedResponse;
        }
    }
}
