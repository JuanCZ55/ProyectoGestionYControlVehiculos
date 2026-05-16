using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Service(
        bool aceite,
        bool filtroDeAceite,
        bool bombaAceite,
        bool filtroDeAire,
        bool filtroDeCombustible,
        bool bombaCombustible,
        bool alineoBalanceo,
        bool bombaAgua,
        bool correaPolyV,
        bool correaDentada,
        bool bujias,
        int kmService,
        bool excepcional,
        string? servicioExcepcional,
        string proveedor,
        int idVehiculo,
        string? detalle,
        DateOnly? fecha,
        bool realizado,
        bool estado
    )
    {
        [Key]
        public int IdService { get; set; }
        public bool Bujias { get; set; } = bujias;
        public bool BombaCombustible { get; set; } = bombaCombustible;

        public bool FiltroDeAire { get; set; } = filtroDeAire;

        public bool FiltroDeAceite { get; set; } = filtroDeAceite;

        public bool FiltroDeCombustible { get; set; } = filtroDeCombustible;

        public bool CorreaPolyV { get; set; } = correaPolyV;

        public bool CorreaDentada { get; set; } = correaDentada;

        public bool AlineoBalanceo { get; set; } = alineoBalanceo;

        public bool BombaAgua { get; set; } = bombaAgua;

        public bool BombaAceite { get; set; } = bombaAceite;
        public bool Aceite { get; set; } = aceite;
        public bool Excepcional { get; set; } = excepcional;
        public string? ServicioExcepcional { get; set; } = servicioExcepcional;
        public bool Realizado { get; set; } = realizado;

        [Required]
        [MinLength(3)]
        [MaxLength(100)]
        public string Proveedor { get; set; } = proveedor;

        [Required]
        
        public int KmService { get; set; } = kmService;

        public string? Detalle { get; set; } = detalle;

        public DateOnly? Fecha { get; set; } = fecha;

        [ForeignKey("Vehiculo")]
        public int IdVehiculo { get; set; } = idVehiculo;
        public Vehiculo? Vehiculo { get; set; } = null!;
        public bool Estado { get; set; } = estado;

        public Service()
            : this(
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                0,
                false,
                null,
                string.Empty,
                0,
                null,
                DateOnly.FromDateTime(DateTime.Now),
                false,
                true
            ) { }
    }
}
