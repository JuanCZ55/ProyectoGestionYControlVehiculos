using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Usuario(
        string gmail,
        string contrasena,
        string? avatarUrl,
        int idRol,
        int idPersona,
        bool estado
    )
    {
        [Key]
        public int IdUsuario { get; set; }

        [Required]
        [EmailAddress]
        public string Gmail { get; set; } = gmail;

        [Required]
        [MinLength(8)]
        public string Contrasena { get; set; } = contrasena;

        public string? AvatarUrl { get; set; } = avatarUrl;

        [ForeignKey("Rol")]
        public int IdRol { get; set; } = idRol;
        public Rol? Rol { get; set; } = null!;

        [ForeignKey("Persona")]
        public int IdPersona { get; set; } = idPersona;
        public Persona? Persona { get; set; } = null!;
        public List<Auditoria>? Auditoria { get; set; }

        public List<MensajeChat>? MensajeChat { get; set; }
        public bool Estado { get; set; } = estado;

        public Usuario()
            : this(default!, default!, default, default, default, true) { }
    }
}
