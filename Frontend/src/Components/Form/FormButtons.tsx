import NavButton from "../NavButton";
import "../css/FormButtons.css";

interface FormButtonsProps<T> {
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  initialState: T;
  formClear: () => void;
  disabledSubmitButton?: boolean;
}

export default function FormButtons<T>({
  setFormData,
  initialState,
  formClear,
  disabledSubmitButton,
}: FormButtonsProps<T>) {
  const formReset = () => {
    setFormData(initialState);
    formClear();
  };

  return (
    <div className="d-flex flex-wrap justify-content-center gap-3 mt-4 w-100">
      <NavButton
        iconClass="bi bi-arrow-left-circle-fill"
        text=" Volver"></NavButton>

      <button type="reset" className="btn-cancel" onClick={formReset}>
        <i className="bi bi-eraser-fill"></i> Limpiar
      </button>

      <button
        type="submit"
        className="btn-submit"
        disabled={disabledSubmitButton}>
        <i className="bi bi-send"></i> Enviar
      </button>
    </div>
  );
}
