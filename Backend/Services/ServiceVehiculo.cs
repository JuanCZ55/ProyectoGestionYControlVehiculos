using AutoMapper;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class ServiceVehiculo
    {
        private readonly AppDbContext _context;
        private readonly IMapper mapper;
        private readonly ServiceMatafuego serviceMatafuego;
        private readonly IServiceProvider serviceProvider;
        public ServiceVehiculo(AppDbContext context, IMapper mapper, ServiceMatafuego serviceMatafuego, IServiceProvider serviceProvider )
        {
            _context = context;
            this.mapper = mapper;
            this.serviceMatafuego = serviceMatafuego;
            this.serviceProvider = serviceProvider;
        }

        public async Task<List<VehiculoDto>> GetAllNotPaginated()
        {
            return await _context.Vehiculos
                .Include(m => m.Matafuego)
                .Where(v => v.Estado == true)
                .OrderBy(v => v.IdVehiculo)
                .Select(v => new VehiculoDto
                {
                    IdVehiculo = v.IdVehiculo,
                    Marca = v.Marca,
                    Modelo = v.Modelo,
                    Anio = v.Anio,
                    Patente = v.Patente,
                    Color = v.Color,
                    CantidadNeumaticos = v.CantidadNeumaticos,
                    CantidadAuxilios = v.CantidadAuxilios,
                    NumeroChasis = v.NumeroChasis,
                    NumeroMotor = v.NumeroMotor,
                    IdMatafuego = v.IdMatafuego,
                    Matafuego = v.Matafuego != null
                        ? new MatafuegoDto
                        {
                            IdMatafuego = v.Matafuego.IdMatafuego,
                            NroSerie = v.Matafuego.NroSerie,
                            Proveedor = v.Matafuego.Proveedor,
                            FechaCarga = v.Matafuego.FechaCarga,
                            FechaVencimiento = v.Matafuego.FechaVencimiento,
                            Estado = v.Matafuego.Estado,
                        }
                        : null,
                    Estado = v.Estado,
                })
                .ToListAsync();
        }
        
        // GET TODO VEHICULOS
        public async Task<PagedResponse<VehiculoDto>> GetAllAsync(
            int nroPagina,
            int tamanoPagina,
            bool? estado = null
        )
        {
            IQueryable<Vehiculo> query = _context.Vehiculos;
            if (estado.HasValue)
            {
                query = query.Where(v => v.Estado == estado);
            }
            int totalRegistrosVehiculo = await query.CountAsync();
            List<VehiculoDto>? vehiculos = await query
                .Include(m => m.Matafuego)
                .OrderBy(v => v.IdVehiculo)
                .Skip((nroPagina - 1) * tamanoPagina)
                .Take(tamanoPagina)
                .Select(v => new VehiculoDto
                {
                    IdVehiculo = v.IdVehiculo,
                    Marca = v.Marca,
                    Modelo = v.Modelo,
                    Anio = v.Anio,
                    Patente = v.Patente,
                    Color = v.Color,
                    CantidadNeumaticos = v.CantidadNeumaticos,
                    CantidadAuxilios = v.CantidadAuxilios,
                    NumeroChasis = v.NumeroChasis,
                    NumeroMotor = v.NumeroMotor,
                    IdMatafuego = v.IdMatafuego,
                    Matafuego =
                        v.Matafuego != null
                            ? new MatafuegoDto
                            {
                                IdMatafuego = v.Matafuego.IdMatafuego,
                                NroSerie = v.Matafuego.NroSerie,
                                Proveedor = v.Matafuego.Proveedor,
                                FechaCarga = v.Matafuego.FechaCarga,
                                FechaVencimiento = v.Matafuego.FechaVencimiento,
                                Estado = v.Matafuego.Estado,
                            }
                            : null,
                    Estado = v.Estado,
                })
                .ToListAsync();
            return new PagedResponse<VehiculoDto>(
                vehiculos,
                totalRegistrosVehiculo,
                nroPagina,
                tamanoPagina
            );
        }

        // VEHICULO POR ID
        public async Task<Vehiculo?> GetByIdAsync(int id)
        {
            return await _context.Vehiculos.FindAsync(id);
        }

        // GET VEHICULO POR PATENTE
        public async Task<Vehiculo?> GetByPatenteAsync(string patente)
        {
            return await _context.Vehiculos.FirstOrDefaultAsync(v => v.Patente == patente);
        }

        // GET VEHICULO POR PATENTE %LIKE%
        public async Task<List<VehiculoDto>> GetByPatenteLikeAsync(string patente)
        {
            return await _context
                .Vehiculos.Include(m => m.Matafuego)
                .Where(v => EF.Functions.Like(v.Patente, $"%{patente}%"))
                .Select(v => new VehiculoDto
                {
                    IdVehiculo = v.IdVehiculo,
                    Marca = v.Marca,
                    Modelo = v.Modelo,
                    Anio = v.Anio,
                    Patente = v.Patente,
                    Color = v.Color,
                    CantidadNeumaticos = v.CantidadNeumaticos,
                    CantidadAuxilios = v.CantidadAuxilios,
                    NumeroChasis = v.NumeroChasis,
                    NumeroMotor = v.NumeroMotor,
                    IdMatafuego = v.IdMatafuego,
                    Matafuego =
                        v.Matafuego != null
                            ? new MatafuegoDto
                            {
                                IdMatafuego = v.Matafuego.IdMatafuego,
                                NroSerie = v.Matafuego.NroSerie,
                                Proveedor = v.Matafuego.Proveedor,
                                FechaCarga = v.Matafuego.FechaCarga,
                                FechaVencimiento = v.Matafuego.FechaVencimiento,
                                Estado = v.Matafuego.Estado,
                            }
                            : null,
                    Estado = v.Estado,
                })
                .ToListAsync();
        }

        // GET VEHICULO POR NUMERO DE MOTOR
        public async Task<Vehiculo?> GetByNumeroMotorAsync(string numeroMotor)
        {
            return await _context.Vehiculos.FirstOrDefaultAsync(v => v.NumeroMotor == numeroMotor);
        }

        // GET VEHICULO POR NUMERO DE CHASIS
        public async Task<Vehiculo?> GetByNumeroChasisAsync(string numeroChasis)
        {
            return await _context.Vehiculos.FirstOrDefaultAsync(v =>
                v.NumeroChasis == numeroChasis
            );
        }

        // NUEVO VEHICULO
        public async Task<Vehiculo> AddAsync(Vehiculo vehiculo)
        {
            if (await GetByPatenteAsync(vehiculo.Patente) != null)
                throw new InvalidOperationException(
                    "Ya existe un vehiculo con la patente " + vehiculo.Patente
                ); //Manejar en el controller
            if (await GetByNumeroMotorAsync(vehiculo.NumeroMotor) != null)
                throw new InvalidOperationException(
                    "Ya existe un vehiculo con el numero de motor " + vehiculo.NumeroMotor
                ); //Manejar en el controller
            if (await GetByNumeroChasisAsync(vehiculo.NumeroChasis) != null)
                throw new InvalidOperationException(
                    "Ya existe un vehiculo con el numero de chasis " + vehiculo.NumeroChasis
                ); //Manejar en el controller
            _context.Vehiculos.Add(vehiculo);
            await _context.SaveChangesAsync();
            return vehiculo;
        }

        // UPDATE VEHICULO
        public async Task UpdateAsync(int id, UpdateVehiculoDto vehiculoDto)
        {
            Vehiculo? vehiculoFinded = await _context.Vehiculos.FindAsync(id);
            if (
                vehiculoFinded != null
                && vehiculoDto.NumeroChasis != null
                && await GetByNumeroChasisAsync((string)vehiculoDto.NumeroChasis)
                    is Vehiculo vehiculoExistente
                && vehiculoExistente.IdVehiculo != id
            )
                throw new InvalidOperationException(
                    "Ya existe un vehiculo con el numero de chasis " + vehiculoDto.NumeroChasis
                ); //Manejar en el controller
            if (
                vehiculoFinded != null
                && vehiculoDto.NumeroMotor != null
                && await GetByNumeroMotorAsync((string)vehiculoDto.NumeroMotor)
                    is Vehiculo vehiculoExistente2
                && vehiculoExistente2.IdVehiculo != id
            )
                throw new InvalidOperationException(
                    "Ya existe un vehiculo con el numero de motor " + vehiculoDto.NumeroMotor
                ); //Manejar en el controller
            if (
                vehiculoFinded != null
                && vehiculoDto.Patente != null
                && await GetByPatenteAsync((string)vehiculoDto.Patente)
                    is Vehiculo vehiculoExistente3
                && vehiculoExistente3.IdVehiculo != id
            )
                throw new InvalidOperationException(
                    "Ya existe un vehiculo con la patente " + vehiculoDto.Patente
                ); //Manejar en el controller
            if (vehiculoFinded == null)
                throw new KeyNotFoundException("Vehiculo con id " + id + " no encontrado");
            mapper.Map(vehiculoDto, vehiculoFinded);
            _context.Vehiculos.Update(vehiculoFinded);
            await _context.SaveChangesAsync();
        }

        // ELIMINAR VEHICULO
        public async Task<bool> DeleteAsync(int id)
        {
            if (await serviceProvider.GetService<ServiceDocumento>().ValidateNotDocumentsOnDelete(id, typesOfRecord.Vehiculo) is (bool result) && result)
                throw new InvalidOperationException("El vehiculo tiene DOCUMENTOS registrados, eliminelos para poder realizar la eliminacion");
            var vehiculo = await _context.Vehiculos.FindAsync(id);
            if (vehiculo == null)
                return false;
            _context.Vehiculos.Remove(vehiculo);
            return await _context.SaveChangesAsync() > 0;
        }

        // BAJA LOGICA VEHICULO
        public async Task<bool> SoftDeleteAsync(int id)
        {
            var vehiculo = await _context.Vehiculos.FindAsync(id);
            if (vehiculo == null)
                return false;
            vehiculo.Estado = false;
            _context.Vehiculos.Update(vehiculo);
            return await _context.SaveChangesAsync() > 0;
        }

        // ALTA LOGICA VEHICULO
        public async Task<bool> RestoreAsync(int id)
        {
            var vehiculo = await _context.Vehiculos.FindAsync(id);
            if (vehiculo == null)
                return false;
            vehiculo.Estado = true;
            _context.Vehiculos.Update(vehiculo);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> AsignarMatafuegoAVehiculo(int idMatafuego, int idVehiculo)
        {
            Matafuego? matafuego = await _context.Matafuegos.FindAsync(idMatafuego);
            if (matafuego == null)
                throw new KeyNotFoundException(
                    "Matafuego con id " + idMatafuego + " no encontrado"
                );
            if (!matafuego.Estado)
                throw new InvalidOperationException("El matafuego seleccionado esta dado de baja");
            if (await serviceMatafuego.MatafuegoAsignadoAVehiculo(idMatafuego) is true)
                throw new InvalidOperationException(
                    "El matafuego  ya se encuentra asignado a un vehiculo"
                );
            Vehiculo? vehiculo = await _context.Vehiculos.FindAsync(idVehiculo);
            if (vehiculo == null)
                throw new KeyNotFoundException("Vehiculo con id " + idVehiculo + " no encontrado");
            if (!vehiculo.Estado)
                throw new InvalidOperationException("El vehiculo esta dado de baja");
            vehiculo.IdMatafuego = idMatafuego;
            _context.Vehiculos.Update(vehiculo);
            return await _context.SaveChangesAsync() > 0;
        }

public async Task<VehiculoDto?> GetById(int id)
        {
            // Se aplica el filtro 'Where' ANTES del 'Select' para que la búsqueda por ID
            // se ejecute en la base de datos, lo cual es mucho más eficiente.
            return await _context.Vehiculos
                .Where(v => v.IdVehiculo == id)
                .Select(v => new VehiculoDto
                    {
                        IdVehiculo = v.IdVehiculo,
                        Marca = v.Marca,
                        Modelo = v.Modelo,
                        Anio = v.Anio,
                        Patente = v.Patente,
                        Color = v.Color,
                        CantidadNeumaticos = v.CantidadNeumaticos,
                        CantidadAuxilios = v.CantidadAuxilios,
                        NumeroChasis = v.NumeroChasis,
                        NumeroMotor = v.NumeroMotor,
                        IdMatafuego = v.IdMatafuego,
                        Matafuego = v.Matafuego != null
                            ? new MatafuegoDto
                            {
                                IdMatafuego = v.Matafuego.IdMatafuego,
                                NroSerie = v.Matafuego.NroSerie,
                                Proveedor = v.Matafuego.Proveedor,
                                FechaCarga = v.Matafuego.FechaCarga,
                                FechaVencimiento = v.Matafuego.FechaVencimiento,
                                Estado = v.Matafuego.Estado,
                            }
                            : null,
                        Estado = v.Estado,
                    })
                .FirstOrDefaultAsync();
        }
    }
}
