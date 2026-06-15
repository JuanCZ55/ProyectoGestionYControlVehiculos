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
        public async Task<List<RegistroKilometraje>> ObtenerRegistrosAsync(bool misRegistros, bool estado, int idUsuarioActual)
        {
            // 1. Iniciamos la consulta base (solo registros activos si manejas baja lógica)
            IQueryable<RegistroKilometraje> query = _context.RegistrosKilometraje
                .Where(r => r.Estado == estado);

            // 2. Si el parámetro 'misRegistros' es true, filtramos usando la Auditoría
            if (misRegistros)
            {
                // Usamos tus constantes estandarizadas NombreClases y AccionAuditoria
                var idsCreadosPorUsuario = await _context.Auditorias
                    .Where(a => a.IdUsuario == idUsuarioActual
                             && a.Entidad == NombreClases.RegistroKilometraje
                             && a.Accion == AccionAuditoria.Create) // Reemplaza "Crear" por la constante exacta que uses
                    .Select(a => a.IdEntidad)
                    .Distinct()
                    .ToListAsync();

                // Aplicamos el filtro a la consulta principal
                query = query.Where(r => idsCreadosPorUsuario.Contains(r.IdRegistroKilometraje));
            }

            // 3. Ejecutamos la consulta a la base de datos
            var registros = await query.ToListAsync();

            // 4. Mapeamos a DTO y retornamos
            return registros;
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
            return await _context
                .RegistrosKilometraje.OrderByDescending(register => register.FechaRegistro)
                .FirstOrDefaultAsync(r => r.IdVehiculo == idVehiculo);
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
            if (await _serviceVehiculo.GetByIdAsync(registroKilometraje.IdVehiculo) is (Vehiculo veh) && !veh.Estado)
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
