using System.ComponentModel.DataAnnotations;

public class CreateServiceDto
{
    public CreateServiceDto() { }

    [Required]
    public int IdVehiculo { get; set; }

    public bool? FiltroDeAire { get; set; }

    public bool? FiltroDeAceite { get; set; }

    public bool? FiltroDeCombustible { get; set; }

    public bool? CorreaPolyV { get; set; }

    public bool? CorreaDentada { get; set; }

    public bool? AlineoBalanceo { get; set; }

    [Required]
    [Range(0, int.MaxValue)]
    public int? KmService { get; set; }

    [MaxLength(10000)]
    public string? Detalle { get; set; }

    public DateOnly? Fecha { get; set; }

    public bool Estado { get; set; } = true;

    public bool? Aceite { get; set; }

    public bool? BombaAceite { get; set; }

    public bool? BombaAgua { get; set; }

    public bool? BombaCombustible { get; set; }

    public bool? Bujias { get; set; }

    public bool? Excepcional { get; set; } = false;

    [MaxLength(100)]
    public string? Proveedor { get; set; }

    public bool? Realizado { get; set; }

    public string? ServicioExcepcional { get; set; }
}
