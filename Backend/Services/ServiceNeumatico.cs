using AutoMapper;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class ServiceNeumatico
    {
        private readonly AppDbContext _context;
        private readonly IMapper mapper;
        public ServiceNeumatico(AppDbContext context, IMapper mapper )
        {
            _context = context;
            this.mapper = mapper;
        }

        // GET TODO NEUMATICOS
        public async Task<PagedResponse<Neumatico>> GetAllAsync(int nroPagina, int tamanoPagina)
        {
            IQueryable<Neumatico> query = _context.Neumaticos;
            int totalRegistrosNeumatico = await query.CountAsync();
            List<Neumatico>? neumaticos = await query
                .OrderBy(n => n.IdNeumatico)
                .Skip((nroPagina - 1) * tamanoPagina)
                .Take(tamanoPagina)
                .ToListAsync();
            return new PagedResponse<Neumatico>(
                neumaticos,
                totalRegistrosNeumatico,
                nroPagina,
                tamanoPagina
            );
        }

        public async Task<PagedResponse<Neumatico>?> GetAllAssignedToAsync(
            int idVehiculo,
            int nroPagina,
            int tamanoPagina
        )
        {
            IQueryable<Neumatico> query = _context.Neumaticos.Where(n =>
                n.IdVehiculo == idVehiculo
            );
            int totalRegistrosNeumatico = await query.CountAsync();
            List<Neumatico>? neumaticos = await query
                .OrderBy(n => n.IdNeumatico)
                .Skip((nroPagina - 1) * tamanoPagina)
                .Take(tamanoPagina)
                .ToListAsync();
            return new PagedResponse<Neumatico>(
                neumaticos,
                totalRegistrosNeumatico,
                nroPagina,
                tamanoPagina
            );
        }

        public async Task<PagedResponse<Neumatico>> GetAllNotAssignedAsync(
            int nroPagina,
            int tamanoPagina
        )
        {
            IQueryable<Neumatico> query = _context.Neumaticos.Where(n =>
                n.IdVehiculo == null && n.Estado == true
            );
            int totalRegistrosNeumatico = await query.CountAsync();
            List<Neumatico>? neumaticos = await query
                .Where(n => n.IdVehiculo == null && n.Estado == true)
                .OrderBy(n => n.IdNeumatico)
                .Skip((nroPagina - 1) * tamanoPagina)
                .Take(tamanoPagina)
                .ToListAsync();
            return new PagedResponse<Neumatico>(
                neumaticos,
                totalRegistrosNeumatico,
                nroPagina,
                tamanoPagina
            );
        }

        // NEUMATICO POR ID
        public async Task<Neumatico?> GetByIdAsync(int id)
        {
            return await _context.Neumaticos.FindAsync(id);
        }

        // NUEVO NEUMATICO
        public async Task<Neumatico> AddAsync(Neumatico neumatico)
        {
            _context.Neumaticos.Add(neumatico);
            await _context.SaveChangesAsync();
            return neumatico;
        }

        public async Task<bool> AsignarNeumaticoAsync(int idVehiculo, int idNeumatico)
        {
            Vehiculo? vehiculo = await _context.Vehiculos.FindAsync(idVehiculo);
            Neumatico? neumatico = await _context.Neumaticos.FindAsync(idNeumatico);
            if (vehiculo == null || neumatico == null)
                throw new KeyNotFoundException(
                    "No se puede asignar el neumatico: no existe el neumatico con id " + idNeumatico
                );

            if (vehiculo == null)
                throw new KeyNotFoundException(
                    "No se puede asignar el neumatico: no existe el vehiculo con id " + idVehiculo
                );
            //if (!vehiculo.Estado)
            //    throw new InvalidOperationException("El vehiculo esta dado de baja");
            neumatico.IdVehiculo = vehiculo.IdVehiculo;
            _context.Neumaticos.Update(neumatico);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> BorrarAsignacionAsync(int idNeumatico)
        {
            var neumatico = await _context.Neumaticos.FindAsync(idNeumatico);
            if (neumatico == null)
                throw new KeyNotFoundException(
                    "No se puede borrar la asignacion: no existe el neumatico con id " + idNeumatico
                );
            neumatico.IdVehiculo = null;
            _context.Neumaticos.Update(neumatico);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> CambiarNeumaticoAsync(int idOld, int idNew)
        {
            Neumatico? neumaticoOld = await _context.Neumaticos.FindAsync(idOld);
            Neumatico? neumaticoNew = await _context.Neumaticos.FindAsync(idNew);
            if (neumaticoOld == null || neumaticoNew == null)
                throw new KeyNotFoundException(
                    "No se puede cambiar el neumatico: no existe el neumatico con id "
                        + (neumaticoOld is null ? idOld : idNew)
                );
            neumaticoNew.IdVehiculo = neumaticoOld.IdVehiculo;
            neumaticoOld.IdVehiculo = null;
            _context.Neumaticos.Update(neumaticoOld);
            _context.Neumaticos.Update(neumaticoNew);
            return await _context.SaveChangesAsync() > 0;
        }

        // UPDATE NEUMATICO
        public async Task UpdateAsync(int id, UpdateNeumaticoDto neumaticoDto)
        {
            Neumatico? neumaticoFinded = await _context.Neumaticos.FindAsync(id);
            if (neumaticoFinded == null)
                throw new KeyNotFoundException("Neumatico con id " + id + " no encontrado");
            mapper.Map(neumaticoDto, neumaticoFinded);
            _context.Neumaticos.Update(neumaticoFinded);
            await _context.SaveChangesAsync();
        }

        // ELIMINAR NEUMATICO
        public async Task<bool> DeleteAsync(int id)
        {
            var neumatico = await _context.Neumaticos.FindAsync(id);
            if (neumatico == null)
                return false;

            _context.Neumaticos.Remove(neumatico);
            return await _context.SaveChangesAsync() > 0;
        }

        // BAJA LOGICA NEUMATICO
        public async Task<bool> SoftDeleteAsync(int id)
        {
            var neumatico = await _context.Neumaticos.FindAsync(id);
            if (neumatico == null)
                return false;
            neumatico.Estado = false;
            _context.Neumaticos.Update(neumatico);
            return await _context.SaveChangesAsync() > 0;
        }

        // ALTA LOGICA NEUMATICO
        public async Task<bool> RestoreAsync(int id)
        {
            var neumatico = await _context.Neumaticos.FindAsync(id);
            if (neumatico == null)
                return false;
            neumatico.Estado = true;
            _context.Neumaticos.Update(neumatico);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
