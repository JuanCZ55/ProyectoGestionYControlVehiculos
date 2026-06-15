using AutoMapper;
using Backend.Helpers;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class ServiceService
    {
        private readonly AppDbContext _context;
        private readonly IMapper mapper;
        private readonly ServiceRegistroKilometraje _serviceRegistroKilometraje;

        public ServiceService(AppDbContext context, IMapper mapper, ServiceRegistroKilometraje serviceRegistroKilometraje)
        {
            _context = context;
            this.mapper = mapper;
            _serviceRegistroKilometraje = serviceRegistroKilometraje;
        }
        public async Task<List<Service>> ObtenerRegistrosAsync(bool misRegistros, bool estado, int idUsuarioActual)
        {
            IQueryable<Service> query = _context.Services
                .Where(s => s.Estado == estado);

            if (misRegistros)
            {
                var idsCreadosPorUsuario = await _context.Auditorias
                    .Where(a => a.IdUsuario == idUsuarioActual
                             && a.Entidad == NombreClases.Service   
                             && a.Accion == AccionAuditoria.Create)
                    .Select(a => a.IdEntidad)
                    .Distinct()
                    .ToListAsync();

                query = query.Where(r => idsCreadosPorUsuario.Contains(r.IdService));
            }

            var registros = await query.ToListAsync();

            return registros;
        }
        // GET TODO SERVICIOS
        public async Task<PagedResponse<Service>> GetAllAsync(int nroPagina, int tamanoPagina)
        {
            IQueryable<Service> query = _context.Services;
            int totalRegistrosService = await query.CountAsync();
            List<Service>? services = await query
                .OrderBy(s => s.IdService)
                .Skip((nroPagina - 1) * tamanoPagina)
                .Take(tamanoPagina)
                .ToListAsync();
            return new PagedResponse<Service>(
                services,
                totalRegistrosService,
                nroPagina,
                tamanoPagina
            );
        }

        // SERVICIO POR ID
        public async Task<Service?> GetByIdAsync(int id)
        {
            return await _context.Services.FindAsync(id);
        }

        // NUEVO SERVICIO
        public async Task<Service> AddAsync(Service service)
        {
            if (ValidarService.validarTodosLosItemsEnFalse(service))
                throw new InvalidOperationException("No puede crear un servicio con todos los campos vacios");
            if (service.KmService == 0 && await this.BuscarServicioConKilometraje(service.IdVehiculo) is (Service servicioConKilometraje) && servicioConKilometraje.KmService > 0)
                throw new InvalidOperationException("El vehiculo tiene registros con kilometraje, por lo tanto no puede ser 0");
            if(service.KmService > 0 && await _serviceRegistroKilometraje.GetLatestRegistroKilometrajeByVehiculoIdAsync(service.IdVehiculo) is (RegistroKilometraje ultimoRegistroDeKilometraje) && service.KmService < ultimoRegistroDeKilometraje.Kilometraje)
                throw new InvalidOperationException("El kilometraje del servicio no puede ser menor al ultimo registro de kilometraje");
            if(!String.IsNullOrEmpty(service.ServicioExcepcional))
                service.Excepcional = true;
            if(await _serviceRegistroKilometraje.GetLatestRegistroKilometrajeByVehiculoIdAsync(service.IdVehiculo) is (RegistroKilometraje ultimoRegistroDeKilometraje2) && service.KmService > ultimoRegistroDeKilometraje2.Kilometraje)
            {
                await _serviceRegistroKilometraje.AddAsync(new RegistroKilometraje
                {
                    IdVehiculo = service.IdVehiculo,
                    Kilometraje = service.KmService,
                    FechaRegistro = DateTime.Now,
                    Estado = true
                });
            }
            _context.Services.Add(service);
            await _context.SaveChangesAsync();
            return service;
        }

        // UPDATE SERVICIO
        public async Task UpdateAsync(int id, UpdateServiceDto serviceDto)
        {
            Service? serviceFinded = await _context.Services.FindAsync(id);
            if (serviceFinded == null)
                throw new KeyNotFoundException("Service con id " + id + " no encontrado");
            mapper.Map(serviceDto, serviceFinded);
            _context.Services.Update(serviceFinded);
            await _context.SaveChangesAsync();
        }
        public async Task<Service?> BuscarServicioConKilometraje(int idVehiculo)
        {
            return _context.Services.Where(service => (service.IdVehiculo == idVehiculo && service.KmService > 0)).FirstOrDefault();
        }
        // ELIMINAR SERVICIO
        public async Task<bool> DeleteAsync(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null)
                return false;

            _context.Services.Remove(service);
            return await _context.SaveChangesAsync() > 0;
        }

        // BAJA LOGICA SERVICIO
        public async Task<bool> SoftDeleteAsync(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null)
                return false;

            service.Estado = false;
            _context.Services.Update(service);
            return await _context.SaveChangesAsync() > 0;
        }

        // ALTA LOGICA SERVICIO
        public async Task<bool> RestoreAsync(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null)
                return false;

            service.Estado = true;
            _context.Services.Update(service);
            return await _context.SaveChangesAsync() > 0;
        }

        // GET SERVICIOS POR ID VEHICULO

        public async Task<PagedResponse<Service>> GetServiceByVehicleId(
            int vehiculoId,
            int nroPagina,
            int tamanoPagina
        )
        {
            var query = _context.Services.Where(s => s.IdVehiculo == vehiculoId);
            var totalRegistros = await query.CountAsync();
            var items = await query.OrderByDescending(s => s.IdService)
                .Skip((nroPagina - 1) * tamanoPagina)
                .Take(tamanoPagina)
                .ToListAsync();

            return new PagedResponse<Service>(items, totalRegistros, nroPagina, tamanoPagina);
        }

        // MARCAR SERVICIO COMO RESUELTO
        public async Task<bool> MarcarServicioResueltoAsync(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null)
                return false;

            service.Realizado = true;
            _context.Services.Update(service);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> MarcarServicioComoNoResueltoAsync(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null)
                return false;

            service.Realizado = false;
            _context.Services.Update(service);
            return await _context.SaveChangesAsync() > 0;
        }
        public async Task<Service?> getUltimoServiceByVehiculo(int idVehiculo)
        {
            return await _context.Services.OrderByDescending(service => service.Fecha).FirstOrDefaultAsync(s => s.IdVehiculo == idVehiculo);
        }
        
    }
}
