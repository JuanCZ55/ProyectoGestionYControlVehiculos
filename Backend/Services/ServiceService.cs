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
        private readonly ServiceAuditoria _serviceAuditoria;

        public ServiceService(
            AppDbContext context,
            IMapper mapper,
            ServiceRegistroKilometraje serviceRegistroKilometraje,
            ServiceAuditoria serviceAuditoria
        )
        {
            _context = context;
            this.mapper = mapper;
            _serviceRegistroKilometraje = serviceRegistroKilometraje;
            _serviceAuditoria = serviceAuditoria;
        }

        public async Task<List<Service>> ObtenerRegistrosAsync(
            bool misRegistros,
            bool estado,
            int idUsuarioActual
        )
        {
            IQueryable<Service> query = _context.Services.Where(s => s.Estado == estado);

            if (misRegistros)
            {
                var idsCreadosPorUsuario = await _context
                    .Auditorias.Where(a =>
                        a.IdUsuario == idUsuarioActual
                        && a.Entidad == NombreClases.Service
                        && a.Accion == AccionAuditoria.Create
                    )
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

        // MÉTODO PRIVADO PARA CENTRALIZAR LAS VALIDACIONES
        private async Task<RegistroKilometraje?> ValidarReglasNegocioAsync(
            Service service,
            bool validarKilometraje = true
        )
        {
            if (ValidarService.validarTodosLosItemsEnFalse(service))
                throw new InvalidOperationException("Registre al menos un ítem del servicio");

            RegistroKilometraje? registroKilometraje =
                await _serviceRegistroKilometraje.GetLatestRegistroKilometrajeByVehiculoIdAsync(
                    service.IdVehiculo
                );

            // Modificación: Solo validar el kilometraje si el parámetro es true
            if (validarKilometraje)
            {
                if (service.KmService == 0 && registroKilometraje != null)
                    throw new InvalidOperationException(
                        "El KM es obligatorio y debe ser mayor a " + registroKilometraje.Kilometraje
                    );

                if (
                    service.KmService > 0
                    && registroKilometraje != null
                    && registroKilometraje.Kilometraje > service.KmService
                )
                    throw new InvalidOperationException(
                        "El KM debe ser mayor a " + registroKilometraje.Kilometraje
                    );
            }

            if (string.IsNullOrEmpty(service.Proveedor))
            {
                throw new InvalidOperationException("El proveedor es obligatorio");
            }

            if (!string.IsNullOrEmpty(service.ServicioExcepcional))
                service.Excepcional = true;

            return registroKilometraje;
        }

        // CREATE SERVICIO
        public async Task<Service> AddAsync(Service service)
        {
            // Validaciones centralizadas
            RegistroKilometraje? registroKilometraje = await ValidarReglasNegocioAsync(
                service,
                true
            );

            // Registrar el nuevo kilometraje si corresponde
            if (
                service.KmService > 0
                && (
                    registroKilometraje == null
                    || service.KmService > registroKilometraje.Kilometraje
                )
            )
            {
                RegistroKilometraje km = await _serviceRegistroKilometraje.AddAsync(
                    new RegistroKilometraje
                    {
                        IdVehiculo = service.IdVehiculo,
                        Kilometraje = service.KmService,
                        FechaRegistro = DateTime.Now,
                        Estado = true,
                    }
                );

                await _serviceAuditoria.AddAsync(
                    new CreateAuditoriaDto
                    {
                        IdEntidad = km.IdRegistroKilometraje,
                        Entidad = NombreClases.RegistroKilometraje,
                        Accion = AccionAuditoria.Create,
                    }
                );
            }
            service.Fecha = DateOnly.FromDateTime(DateTime.Now);
            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            return service;
        }

        // UPDATE SERVICIO
        public async Task<Service> UpdateAsync(
            int id,
            UpdateServiceDto serviceDto,
            int idUsuarioActual
        )
        {
            Service? serviceFinded = await _context.Services.FindAsync(id);
            if (serviceFinded == null)
                throw new KeyNotFoundException("Servicio con id " + id + " no encontrado");

            bool propio = await _context.Auditorias.AnyAsync(a =>
                a.IdEntidad == id
                && a.Entidad == NombreClases.Service
                && a.Accion == AccionAuditoria.Create
                && a.IdUsuario == idUsuarioActual
            );

            if (!propio)
                throw new UnauthorizedAccessException();
            int kilometrajeOriginal = serviceFinded.KmService;
            mapper.Map(serviceDto, serviceFinded);
            bool kilometrajeModificado = serviceFinded.KmService != kilometrajeOriginal;
            // Validaciones centralizadas
            RegistroKilometraje? registroKilometraje = await ValidarReglasNegocioAsync(
                serviceFinded,
                validarKilometraje: kilometrajeModificado
            );

            // Registrar el nuevo kilometraje si corresponde
            if (
                serviceFinded.KmService > 0
                && (
                    registroKilometraje == null
                    || serviceFinded.KmService > registroKilometraje.Kilometraje
                )
            )
            {
                await _serviceRegistroKilometraje.AddAsync(
                    new RegistroKilometraje
                    {
                        IdVehiculo = serviceFinded.IdVehiculo,
                        Kilometraje = serviceFinded.KmService,
                        FechaRegistro = DateTime.Now,
                        Estado = true,
                    }
                );
            }

            _context.Services.Update(serviceFinded);
            await _context.SaveChangesAsync();
            return new Service
            {
                IdService = serviceFinded.IdService,
                Bujias = serviceFinded.Bujias,
                BombaCombustible = serviceFinded.BombaCombustible,
                FiltroDeAire = serviceFinded.FiltroDeAire,
                FiltroDeAceite = serviceFinded.FiltroDeAceite,
                FiltroDeCombustible = serviceFinded.FiltroDeCombustible,
                CorreaPolyV = serviceFinded.CorreaPolyV,
                CorreaDentada = serviceFinded.CorreaDentada,
                AlineoBalanceo = serviceFinded.AlineoBalanceo,
                BombaAgua = serviceFinded.BombaAgua,
                BombaAceite = serviceFinded.BombaAceite,
                Aceite = serviceFinded.Aceite,
                Excepcional = serviceFinded.Excepcional,
                ServicioExcepcional = serviceFinded.ServicioExcepcional,
                Realizado = serviceFinded.Realizado,
                Proveedor = serviceFinded.Proveedor,
                KmService = serviceFinded.KmService,
                Detalle = serviceFinded.Detalle,
                Fecha = serviceFinded.Fecha,
                IdVehiculo = serviceFinded.IdVehiculo,
                Estado = serviceFinded.Estado,
                currentUser = serviceFinded.currentUser,
                Vehiculo = null,
            };
        }

        public async Task<Service?> BuscarServicioConKilometraje(int idVehiculo)
        {
            return _context
                .Services.Where(service =>
                    (service.IdVehiculo == idVehiculo && service.KmService > 0)
                )
                .FirstOrDefault();
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
            var items = await query
                .OrderByDescending(s => s.IdService)
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
            return await _context
                .Services.OrderByDescending(service => service.Fecha)
                .FirstOrDefaultAsync(s => s.IdVehiculo == idVehiculo);
        }

        public async Task<List<Service>> ObtenerServiciosAsync(
            bool misRegistros,
            bool estado,
            int idUsuarioActual,
            int idVehiculo
        )
        {
            // Definir la consulta base de auditoría para la entidad Service
            var queryAud = _context.Auditorias.Where(a =>
                a.Entidad == NombreClases.Service && a.Accion == AccionAuditoria.Create
            );

            // Filtrar por usuario si se solicitan "mis registros"
            if (misRegistros)
            {
                queryAud = queryAud.Where(a => a.IdUsuario == idUsuarioActual);
            }

            // Obtener los IDs permitidos
            var idAudsPermitidos = queryAud.Select(a => a.IdEntidad).Distinct();

            // Consulta principal (Where -> OrderBy -> Take -> Select)
            return await _context
                .Services.Where(s =>
                    s.Estado == estado
                    && s.IdVehiculo == idVehiculo
                    && idAudsPermitidos.Contains(s.IdService)
                )
                .OrderByDescending(s => s.IdService)
                .Take(30)
                .Select(s => new Service
                {
                    IdService = s.IdService,
                    Bujias = s.Bujias,
                    BombaCombustible = s.BombaCombustible,
                    FiltroDeAire = s.FiltroDeAire,
                    FiltroDeAceite = s.FiltroDeAceite,
                    FiltroDeCombustible = s.FiltroDeCombustible,
                    CorreaPolyV = s.CorreaPolyV,
                    CorreaDentada = s.CorreaDentada,
                    AlineoBalanceo = s.AlineoBalanceo,
                    BombaAgua = s.BombaAgua,
                    BombaAceite = s.BombaAceite,
                    Aceite = s.Aceite,
                    Excepcional = s.Excepcional,
                    ServicioExcepcional = s.ServicioExcepcional,
                    Realizado = s.Realizado,
                    Proveedor = s.Proveedor,
                    KmService = s.KmService,
                    Detalle = s.Detalle,
                    Fecha = s.Fecha,
                    IdVehiculo = s.IdVehiculo,
                    Estado = s.Estado,
                    currentUser =
                        misRegistros
                        || _context.Auditorias.Any(a =>
                            a.IdUsuario == idUsuarioActual
                            && a.Entidad == NombreClases.Service
                            && a.Accion == AccionAuditoria.Create
                            && a.IdEntidad == s.IdService
                        ),
                })
                .ToListAsync();
        }
    }
}
