using System.Runtime.CompilerServices;
using AutoMapper;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class ServiceUsuario
    {
        private readonly AppDbContext _context;
        private readonly IMapper mapper;
        private readonly ServiceRol _serviceRol;
        private readonly ServicePassword _servicePassword;

        public ServiceUsuario(
            AppDbContext context,
            IMapper mapper,
            ServiceRol serviceRol,
            ServicePassword servicePassword
        )
        {
            _context = context;
            this.mapper = mapper;
            _serviceRol = serviceRol;
            _servicePassword = servicePassword;
        }

        // GET TODO USUARIOS
        public async Task<PagedResponse<UsuarioDto>> GetAllAsync(int nroPagina, int tamanoPagina)
        {
            IQueryable<Usuario> query = _context
                .Usuarios.Include(u => u.Persona)
                .Include(u => u.Rol);
            int totalRegistrosUsuario = await query.CountAsync();
            List<UsuarioDto>? usuarios = await query
                .OrderBy(u => u.IdUsuario)
                .Skip((nroPagina - 1) * tamanoPagina)
                .Take(tamanoPagina)
                .Select(u => new UsuarioDto
                {
                    IdUsuario = u.IdUsuario,
                    Gmail = u.Gmail,
                    AvatarUrl = u.AvatarUrl,
                    IdRol = u.IdRol,
                    Rol = u.Rol,
                    IdPersona = u.IdPersona,
                    Persona = u.Persona,
                    Estado = u.Estado,
                })
                .ToListAsync();
            return new PagedResponse<UsuarioDto>(
                usuarios,
                totalRegistrosUsuario,
                nroPagina,
                tamanoPagina
            );
        }

        // USUARIO POR ID
        public async Task<UsuarioDto?> GetByIdAsync(int id)
        {
            Usuario? usuario = await _context
                .Usuarios.Include(u => u.Persona)
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.IdUsuario == id);
            if (usuario == null)
                return null;
            return new UsuarioDto
            {
                IdUsuario = usuario.IdUsuario,
                Gmail = usuario.Gmail,
                AvatarUrl = usuario.AvatarUrl,
                IdRol = usuario.IdRol,
                Rol =
                    usuario.Rol != null
                        ? new Rol { IdRol = usuario.Rol.IdRol, Nombre = usuario.Rol.Nombre }
                        : null,
                IdPersona = usuario.IdPersona,
                Persona =
                    usuario.Persona != null
                        ? new Persona
                        {
                            IdPersona = usuario.Persona.IdPersona,
                            Nombre = usuario.Persona.Nombre,
                            Apellido = usuario.Persona.Apellido,
                            Dni = usuario.Persona.Dni,
                            Estado = usuario.Persona.Estado,
                            FechaNac = usuario.Persona.FechaNac,
                        }
                        : null,
                Estado = usuario.Estado,
            };
        }

        public async Task<Usuario?> getUsuarioByIdPersonaAsync(int id)
        {
            return await _context.Usuarios.FirstOrDefaultAsync(u => u.IdPersona == id);
        }

        public async Task<Usuario?> getUsuarioByEmailAsync(string gmail)
        {
            return await _context.Usuarios.FirstOrDefaultAsync(u => u.Gmail == gmail);
        }

        // NUEVO USUARIO
        public async Task<Usuario> AddAsync(Usuario usuario)
        {
            if (await this.getUsuarioByEmailAsync(usuario.Gmail) is not null)
                throw new InvalidOperationException(
                    "El usuario con gmail " + usuario.Gmail + " ya existe"
                );
            if (await this.getUsuarioByIdPersonaAsync(usuario.IdPersona) is not null)
            {
                throw new InvalidOperationException(
                    "La persona con id " + usuario.IdPersona + " ya tiene un usuario"
                );
            }
            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();
            return usuario;
        }

        // UPDATE USUARIO
        public async Task UpdateAsync(int id, UpdateUsuarioDto usuarioDto)
        {
            Usuario? usuarioFinded = await _context.Usuarios.FindAsync(id);
            if (usuarioFinded == null)
                throw new KeyNotFoundException("Usuario con id " + id + " no encontrado");
            if (usuarioFinded.Gmail != usuarioDto.Gmail && usuarioFinded.IdUsuario != id)
                throw new InvalidOperationException(
                    "El usuario con gmail " + usuarioDto.Gmail + " ya existe"
                );
            mapper.Map(usuarioDto, usuarioFinded);
            _context.Usuarios.Update(usuarioFinded);
            await _context.SaveChangesAsync();
        }

        // ELIMINAR USUARIO
        public async Task<bool> DeleteAsync(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null)
                return false;

            _context.Usuarios.Remove(usuario);
            return await _context.SaveChangesAsync() > 0;
        }

        // BAJA LOGICA USUARIO
        public async Task<bool> SoftDeleteAsync(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null)
                return false;

            usuario.Estado = false;
            _context.Usuarios.Update(usuario);
            return await _context.SaveChangesAsync() > 0;
        }

        //ALTA LOGICA USUARIO
        public async Task<bool> RestoreAsync(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null)
                return false;

            usuario.Estado = true;
            _context.Usuarios.Update(usuario);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateRolUsuario(int id)
        {
            Usuario? usuarioFinded = await _context.Usuarios.FindAsync(id);
            if (usuarioFinded == null)
                throw new KeyNotFoundException("Usuario con id " + id + " no encontrado");
            if (usuarioFinded.IdRol == 0)
            {
                throw new InvalidOperationException("El usuario no tiene rol");
            }
            int rolCount = await _serviceRol.getCountRol();
            if (rolCount == 0)
            {
                throw new InvalidOperationException("No hay roles");
            }
            int newRolId = (usuarioFinded.IdRol == rolCount) ? 1 : usuarioFinded.IdRol + 1;
            usuarioFinded.IdRol = newRolId;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> resetPassword(int id, string contraseña)
        {
            Usuario? usuarioFinded = await _context.Usuarios.FindAsync(id);
            if (usuarioFinded == null)
                throw new KeyNotFoundException("Usuario con id " + id + " no encontrado");
            string password = _servicePassword.HashPassword(contraseña);
            usuarioFinded.Contrasena = password;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> updateAvatar(int id, IFormFile file)
        {
            Usuario? usuarioFinded = await _context.Usuarios.FindAsync(id);
            if (usuarioFinded == null)
                throw new KeyNotFoundException("Usuario con id " + id + " no encontrado");
            string extension = Path.GetExtension(file.FileName);
            string nombreArchivo = $"{id}_{DateTime.Now.Ticks}{extension}";
            string carpeta = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Avatars");
            if (!Directory.Exists(carpeta))
            {
                Directory.CreateDirectory(carpeta);
            }
            string rutaCompleta = Path.Combine(carpeta, nombreArchivo);
            using (var stream = new FileStream(rutaCompleta, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            usuarioFinded.AvatarUrl = nombreArchivo;
            _context.Usuarios.Update(usuarioFinded);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<string?> getRutaAvatar(int id)
        {
            Usuario? usuarioFinded = await _context.Usuarios.FindAsync(id);
            if (usuarioFinded == null)
                throw new KeyNotFoundException("Usuario con id " + id + " no encontrado");
            if (usuarioFinded.AvatarUrl == null)
            {
                return null;
            }
            string rutaAvatar = Path.Combine(
                AppDomain.CurrentDomain.BaseDirectory,
                "Avatars",
                usuarioFinded.AvatarUrl
            );
            if (!File.Exists(rutaAvatar))
            {
                return null;
            }
            return rutaAvatar;
        }
    }
}
