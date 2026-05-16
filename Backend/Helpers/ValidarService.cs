using Backend.Models;

namespace Backend.Helpers
{
    public class ValidarService
    {
        public static bool validarTodosLosItemsEnFalse(Service dto)
        {
            bool allInFalse = !dto.AlineoBalanceo
                && !dto.CorreaDentada 
                && !dto.BombaCombustible 
                && !dto.BombaAgua 
                && !dto.FiltroDeCombustible 
                && !dto.BombaAceite 
                && !dto.FiltroDeAceite 
                && !dto.Aceite 
                && !dto.Bujias 
                && !dto.CorreaDentada 
                && !dto.CorreaPolyV
                && String.IsNullOrEmpty(dto.Detalle)
                && String.IsNullOrEmpty(dto.ServicioExcepcional);
            return allInFalse;
        }
    }
}
