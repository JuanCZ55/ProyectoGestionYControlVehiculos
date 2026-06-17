using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class RegistroKilometraje(
        int idVehiculo,
        DateTime fechaRegistro,
        int kilometraje,
        bool estado
    )
    {
        [Key]
        public int IdRegistroKilometraje { get; set; }

        [Required]
        public int Kilometraje { get; set; } = kilometraje;

        [Required]
        public DateTime FechaRegistro { get; set; } = fechaRegistro;
        public bool Estado { get; set; } = estado;

        [ForeignKey("Vehiculo")]
        // Foreign key
        public int IdVehiculo { get; set; } = idVehiculo;

        // Navigation property
        public Vehiculo? Vehiculo { get; set; } = null!;

        [NotMapped]
        public bool? currentUser { get; set; }

        // Constructor vacío
        public RegistroKilometraje()
            : this(default, default, default, true) { }
    }
}
