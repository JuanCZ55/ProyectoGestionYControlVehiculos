using System.ComponentModel.DataAnnotations;

public class UpdateGmailDto
{
    [Required(ErrorMessage = "El correo es requerido")]
    [EmailAddress(ErrorMessage = "El correo no es valido")]
    [RegularExpression(
        @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|gob|com\.[a-z]{2}|gob\.[a-z]{2})$",
        ErrorMessage = "El correo debe ser válido."
    )]
    public string? Gmail { get; set; }
}
