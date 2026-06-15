using System.ComponentModel.DataAnnotations;

public class CreateAuditoriaDto
{
    public CreateAuditoriaDto() { }

    [Required(ErrorMessage = "El campo {0} es obligatorio")]
    [Range(1, int.MaxValue, ErrorMessage = "El campo {0} debe ser mayor a 0.")]
    public int? IdEntidad { get; set; }

    [Required(ErrorMessage = "El campo {0} es obligatorio")]
    [MinLength(3, ErrorMessage = "El campo {0} debe tener al menos {1} caracteres.")]
    [MaxLength(50, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres.")]
    public string? Entidad { get; set; }

    [Required(ErrorMessage = "El campo {0} es obligatorio")]
    [MinLength(3, ErrorMessage = "El campo {0} debe tener al menos {1} caracteres.")]
    [MaxLength(50, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres.")]
    public string? Accion { get; set; }

    [Required(ErrorMessage = "El campo {0} es obligatorio")]
    [Range(1, int.MaxValue, ErrorMessage = "El campo {0} debe ser mayor a 0.")]
    public int? IdUsuario { get; set; } = null;
}
