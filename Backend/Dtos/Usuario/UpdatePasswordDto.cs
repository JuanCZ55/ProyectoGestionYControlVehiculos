using System.ComponentModel.DataAnnotations;

public class UpdatePasswordDto
{
    // [Required(ErrorMessage = "Se requiere la nueva contraseña para cambiar la contraseña")]
    // [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres")]
    // [RegularExpression(
    //     @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$",
    //     ErrorMessage = "La contraseña debe tener al menos una mayúscula, una minúscula, un número y un carácter especial."
    // )]
    public string NewPassword { get; set; }

    // [Required(ErrorMessage = "Se requiere la contraseña antigua para cambiar la contraseña")]
    public string currentPassword { get; set; }
}
