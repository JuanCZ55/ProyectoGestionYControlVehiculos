import Swal from "sweetalert2";

export const confirmarAccionPeligrosa = (
  funcionAEjecutar: () => void,
  setShowModal: (show: boolean) => void,
  titulo: string = "¿Estás absolutamente seguro?",
  texto: string = 'Esta acción es irreversible. Escribe la palabra "Confirmar" para continuar:',
): void => {
  setShowModal(false);

  Swal.fire({
    title: titulo,
    text: texto,
    input: "text",
    inputPlaceholder: "Escribe Confirmar",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, ejecutar",
    cancelButtonText: "Cancelar",
    didOpen: () => {
      const confirmButton = Swal.getConfirmButton();
      const input = Swal.getInput();

      if (confirmButton) {
        confirmButton.disabled = true;
      }

      if (input) {
        input.addEventListener("input", () => {
          if (confirmButton) {
            confirmButton.disabled = input.value !== "Confirmar";
          }
        });
      }
    },
  }).then((result) => {
    if (result.isConfirmed) {
      funcionAEjecutar();
      return;
    }
    if (result.isDismissed) {
      setShowModal(true);
      return;
    }
  });
};
