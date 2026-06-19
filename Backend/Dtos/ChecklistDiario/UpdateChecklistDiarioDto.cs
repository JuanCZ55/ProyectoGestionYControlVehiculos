using System.ComponentModel.DataAnnotations;

public class UpdateChecklistDiarioDto
{
    public UpdateChecklistDiarioDto() { }

    [Required(ErrorMessage = "El campo {0} es requerido")]
    public bool? FaroDelanteroIzquierdo { get; set; }

    [Required(ErrorMessage = "El campo {0} es requerido")]
    public bool? FaroDelanteroDerecho { get; set; }

    [Required(ErrorMessage = "El campo {0} es requerido")]
    public bool? FaroTraseroIzquierdo { get; set; }

    [Required(ErrorMessage = "El campo {0} es requerido")]
    public bool? FaroTraseroDerecho { get; set; }

    [Required(ErrorMessage = "El campo {0} es requerido")]
    public bool? LiquidoFrenos { get; set; }

    [Required(ErrorMessage = "El campo {0} es requerido")]
    public bool? NivelAceite { get; set; }

    [Required(ErrorMessage = "El campo {0} es requerido")]
    public bool? PresionNeumaticos { get; set; }

    [Required(ErrorMessage = "El campo {0} es requerido")]
    public bool? NivelFrenos { get; set; }

    [Required(ErrorMessage = "El campo {0} es requerido")]
    public bool? NivelRefrigerante { get; set; }

    [Required(ErrorMessage = "El campo {0} es requerido")]
    public bool? NivelAguaParabrisas { get; set; }

    [Required(ErrorMessage = "El campo {0} es requerido")]
    public bool? MatafuegoVigente { get; set; }

    [MaxLength(255, ErrorMessage = "El campo {0} debe tener menos de {1} caracteres")]
    public string? Observaciones { get; set; }
    public DateTime? Fecha { get; set; }

    [Required(ErrorMessage = "El campo {0} es requerido")]
    [Range(1, int.MaxValue, ErrorMessage = "El campo {0} debe ser mayor a {1}")]
    public int IdVehiculo { get; set; }

    [Required(ErrorMessage = "El campo {0} es requerido")]
    public bool? Estado { get; set; }
}
