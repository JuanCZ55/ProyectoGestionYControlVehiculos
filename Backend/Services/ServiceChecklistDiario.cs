using AutoMapper;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class ServiceChecklistDiario
    {
        private readonly AppDbContext _context;
        private readonly IMapper mapper;

        public ServiceChecklistDiario(AppDbContext context, IMapper mapper)
        {
            _context = context;
            this.mapper = mapper;
        }
        public async Task<List<ChecklistDiario>> ObtenerRegistrosAsync(bool misRegistros, bool estado, int idUsuarioActual, int idVehiculo)
        {
            var queryAud = _context.Auditorias.Where(a => a.Entidad == NombreClases.ChecklistDiario && a.Accion == AccionAuditoria.Create);

            if (misRegistros) 
                queryAud = queryAud.Where(a => a.IdUsuario == idUsuarioActual);

            var idAudsPermitidos = queryAud.Select(a => a.IdEntidad).Distinct();

            return await _context.ChecklistsDiarios
                .Take(30)
                .OrderByDescending(c => c.Fecha)
                .Where(c => c.Estado == estado && c.IdVehiculo == idVehiculo && idAudsPermitidos.Contains(c.IdChecklistDiario))
                .Select(c => new ChecklistDiario
                {
                    IdChecklistDiario = c.IdChecklistDiario,
                    IdVehiculo = c.IdVehiculo,
                    Fecha = c.Fecha,
                    FaroDelanteroIzquierdo = c.FaroDelanteroIzquierdo,
                    FaroDelanteroDerecho = c.FaroDelanteroDerecho,
                    FaroTraseroIzquierdo = c.FaroTraseroIzquierdo,
                    FaroTraseroDerecho = c.FaroTraseroDerecho,
                    LiquidoFrenos = c.LiquidoFrenos,
                    NivelAceite = c.NivelAceite,
                    PresionNeumaticos = c.PresionNeumaticos,
                    NivelFrenos = c.NivelFrenos,
                    MatafuegoVigente = c.MatafuegoVigente,
                    NivelRefrigerante = c.NivelRefrigerante,
                    NivelAguaParabrisas = c.NivelAguaParabrisas,
                    Observaciones = c.Observaciones,
                    Estado = c.Estado,
                    currentUser = _context.Auditorias.Any(a => a.IdUsuario == idUsuarioActual && a.Entidad == NombreClases.ChecklistDiario && a.Accion == AccionAuditoria.Create && a.IdEntidad == c.IdChecklistDiario)
                })
                .ToListAsync();
        }


        // GET TODO CHECKLISTDIARIOS
        public async Task<PagedResponse<ChecklistDiario>> GetAllAsync(
            int nroPagina,
            int tamanoPagina
        )
        {
            IQueryable<ChecklistDiario> query = _context.ChecklistsDiarios;
            int totalRegistrosChecklistDiario = await query.CountAsync();
            List<ChecklistDiario>? checklistDiarios = await query
                .AsNoTracking()
                .OrderByDescending(c => c.Fecha)
                .Skip((nroPagina - 1) * tamanoPagina)
                .Take(tamanoPagina)
                .ToListAsync();

            return new PagedResponse<ChecklistDiario>(
                checklistDiarios,
                totalRegistrosChecklistDiario,
                nroPagina,
                tamanoPagina
            );
        }
        
        // CHECKLISTDIARIO POR ID
        public async Task<ChecklistDiario?> GetByIdAsync(int id)
        {
            return await _context.ChecklistsDiarios.FindAsync(id);
        }

        // NUEVO CHECKLISTDIARIO
        public async Task<ChecklistDiario> AddAsync(ChecklistDiario checklistDiario)
        {
            _context.ChecklistsDiarios.Add(checklistDiario);
            await _context.SaveChangesAsync();
            return checklistDiario;
        }

        // UPDATE CHECKLISTDIARIO
        public async Task UpdateAsync(UpdateChecklistDiarioDto checklistDiarioDto, int id)
        {
            ChecklistDiario? checklistDiarioExistente = await this.GetByIdAsync(id);
            if (checklistDiarioExistente == null)
                throw new KeyNotFoundException("ChecklistDiario con id " + id + " no encontrada");
            if (
                checklistDiarioExistente.IdVehiculo != checklistDiarioDto.IdVehiculo
                && await _context.Vehiculos.FindAsync(checklistDiarioDto.IdVehiculo) == null
            )
                throw new KeyNotFoundException(
                    "Vehiculo con id " + checklistDiarioDto.IdVehiculo + " no encontrado"
                );
            mapper.Map(checklistDiarioDto, checklistDiarioExistente);
            await _context.SaveChangesAsync();
        }

        // ELIMINAR CHECKLISTDIARIO
        public async Task<bool> DeleteAsync(int id)
        {
            var checklistDiario = await _context.ChecklistsDiarios.FindAsync(id);
            if (checklistDiario == null)
                throw new KeyNotFoundException("ChecklistDiario con id " + id + " no encontrada");

            _context.ChecklistsDiarios.Remove(checklistDiario);
            return await _context.SaveChangesAsync() > 0;
        }

        // BAJA LOGICA CHECKLISTDIARIO
        public async Task<bool> SoftDeleteAsync(int id)
        {
            var checklistDiario = await _context.ChecklistsDiarios.FindAsync(id);
            if (checklistDiario == null)
                throw new KeyNotFoundException("ChecklistDiario con id " + id + " no encontrada");

            checklistDiario.Estado = false;
            _context.ChecklistsDiarios.Update(checklistDiario);
            return await _context.SaveChangesAsync() > 0;
        }

        // ALTA LOGICA CHECKLISTDIARIO
        public async Task<bool> RestoreAsync(int id)
        {
            var checklistDiario = await _context.ChecklistsDiarios.FindAsync(id);
            if (checklistDiario == null)
                throw new KeyNotFoundException("ChecklistDiario con id " + id + " no encontrada");

            checklistDiario.Estado = true;
            _context.ChecklistsDiarios.Update(checklistDiario);
            return await _context.SaveChangesAsync() > 0;
        }

        // LISTAR CHECKLISTDIARIOS POR VEHICULO ID
        public async Task<PagedResponse<ChecklistDiario>> GetByVehiculoIdAsync(
            int vehiculoId,
            int nroPagina,
            int tamanoPagina
        )
        {
            var query = _context.ChecklistsDiarios.Where(c => c.IdVehiculo == vehiculoId);
            var totalRegistros = await query.CountAsync();
            var items = await query.AsNoTracking().OrderByDescending(c=> c.Fecha)
                .Skip((nroPagina - 1) * tamanoPagina)
                .Take(tamanoPagina)
                .ToListAsync();

            return new PagedResponse<ChecklistDiario>(
                items,
                totalRegistros,
                nroPagina,
                tamanoPagina
            );
        }


    }

}
