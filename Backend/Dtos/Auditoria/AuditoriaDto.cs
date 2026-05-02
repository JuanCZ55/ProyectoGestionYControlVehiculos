using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class AuditoriaDto
    {
        public int IdAuditoria { get; set; }
        public DateTime Fecha { get; set; } = DateTime.Now;

        public int? IdEntidad { get; set; }

        public string? Entidad { get; set; } // query = @SELECT * FROM Auditoria WHERE Entidad = '${nombreEntidad}'-> de acá sacamos el nombre de la entidad e interpolamos a la tabla de la entidad en cuestión.

        public string? Accion { get; set; }

        public int IdUsuario { get; set; }
        public UsuarioDto? Usuario { get; set; } = null!;
    }
}
