using System.Security.Claims;
using AutoMapper;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class ServiceAuditoria
    {
        private readonly AppDbContext _context;
        private readonly IMapper mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ServiceAuditoria(
            AppDbContext context,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor
        )
        {
            _context = context;
            this.mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        // GET TODO AUDITORIAS
        public async Task<PagedResponse<AuditoriaDto>> GetAllAsync(
            int numeroPagina,
            int tamanoPagina
        )
        {
            IQueryable<Auditoria> query = _context.Auditorias;
            int totalRegistrosAuditoria = await query.CountAsync();
            var auditorias = await query
                .Include(u => u.Usuario)
                .OrderBy(a => a.IdAuditoria)
                .Skip((numeroPagina - 1) * tamanoPagina)
                .Take(tamanoPagina)
                .Select(a => new AuditoriaDto
                {
                    IdAuditoria = a.IdAuditoria,
                    Fecha = a.Fecha,
                    IdEntidad = a.IdEntidad,
                    Entidad = a.Entidad,
                    Accion = a.Accion,
                    IdUsuario = a.IdUsuario,
                    Usuario = new UsuarioDto
                    {
                        IdUsuario = a.Usuario!.IdUsuario,
                        Gmail = a.Usuario.Gmail,
                        AvatarUrl = a.Usuario.AvatarUrl,
                        IdRol = a.Usuario.IdRol,
                        Rol = a.Usuario.Rol,
                        IdPersona = a.Usuario.IdPersona,
                        Persona = a.Usuario.Persona,
                        Estado = a.Usuario.Estado,
                    },
                })
                .ToListAsync();
            return new PagedResponse<AuditoriaDto>(
                auditorias,
                totalRegistrosAuditoria,
                numeroPagina,
                tamanoPagina
            );
        }

        // AUDITORIA POR ID
        public async Task<Auditoria?> GetByIdAsync(int id)
        {
            return await _context.Auditorias.FindAsync(id);
        }

        // NUEVA AUDITORIA
        public async Task<Auditoria> AddAsync(CreateAuditoriaDto auditoria)
        {
            string? usuarioId = _httpContextAccessor
                .HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)
                ?.Value;
            int usuarioIdParsed =
                usuarioId != null ? int.Parse(usuarioId)
                : auditoria.IdUsuario != null ? auditoria.IdUsuario!.Value
                : 0;
            Auditoria auditoriaNueva = new Auditoria(
                auditoria.Entidad,
                auditoria.IdEntidad,
                auditoria.Accion,
                usuarioIdParsed
            );
            _context.Auditorias.Add(auditoriaNueva);
            await _context.SaveChangesAsync();
            return auditoriaNueva;
        }

        // UPDATE AUDITORIA
        public async Task UpdateAsync(Auditoria auditoria)
        {
            Auditoria? auditoriaFinded = await this.GetByIdAsync(auditoria.IdAuditoria);
            if (auditoriaFinded == null)
            {
                throw new KeyNotFoundException(
                    "Auditoria con id " + auditoria.IdAuditoria + " no encontrada"
                );
            }
            mapper.Map(auditoria, auditoriaFinded);
            await _context.SaveChangesAsync();
        }

        // ELIMINAR AUDITORIA
        public async Task DeleteAsync(int id)
        {
            Auditoria? auditoria = await _context.Auditorias.FindAsync(id);
            if (auditoria == null)
                throw new KeyNotFoundException("Auditoria con id " + id + " no encontrada");

            _context.Auditorias.Remove(auditoria);
            await _context.SaveChangesAsync();
        }
    }

    // FALTA HACER EL SERVICIO Q REVISA ENTITY NAME Y SU ID PARA TRAERLO SEGUN NECESARIO
}
