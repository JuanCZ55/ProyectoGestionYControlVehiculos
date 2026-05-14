import { useState } from "react";
import {
  MatafuegoSchema,
  type MatafuegoType,
} from "../../types/Matafuego.schema";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../src/Utils/Errors.utils";
import { formatZodErrors } from "../../src/Utils/Validation.utils";
import FormCard from "../../src/Components/Form/FormCard";
import Form from "../../src/Components/Form/Form";
import endpointsAPI from "../../src/Components/Routes/Enrouters";
import FormInput from "../../src/Components/Form/FormInput";
import FormButtons from "../../src/Components/Form/FormButtons";
export const AgregarMatafuego = () => {
  const navigate = useNavigate();
  const intialState: MatafuegoType = {
    NroSerie: 0,
    Proveedor: "",
    FechaCarga: new Date(),
    FechaVencimiento: new Date(),
  };
  const [formData, setFormData] = useState<MatafuegoType>(intialState);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const cleanErrors = () => {
    setErrors({});
  };
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const finalValue =
      type === "date"
        ? new Date(value)
        : name == "NroSerie"
          ? parseInt(value) || 0
          : value;
    setFormData({
      ...formData,
      [name]: finalValue,
    });
  };
  const isFormValid = MatafuegoSchema.safeParse(formData).success;
  console.log("isFormValid", isFormValid);
  const validateForm = (): boolean => {
    const validateFromZod = MatafuegoSchema.safeParse(formData);
    if (!validateFromZod.success) {
      const newErrors = formatZodErrors(validateFromZod.error);
      setErrors(newErrors);
      return false;
    } else {
      setErrors({});
      return true;
    }
  };
  const handleSuccess = () => {
    Swal.fire({
      title: "Kilometraje registrado con éxito",
      icon: "success",
      showCancelButton: true,
      confirmButtonText: "Aceptar y continuar",
      cancelButtonText: "Aceptar y volver al inicio",
    }).then((result) => {
      if (result.isConfirmed) {
        return;
      } else {
        navigate("/");
      }
    });
  };
  const handleErrors = (errorMessage: unknown) => {
    Swal.fire({
      title: "Error al registrar el matafuego",
      text: getErrorMessage(errorMessage, "matafuego"),
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
      <FormCard
        title="Registrar Matafuego"
        classNameCard=" bg-dark rounded-5 text-white "
        styleCard={{ maxWidth: "600px" }}
        classNameHeader="text-center fs-2"
        classNameBody="fs-4">
        <Form
          name="AgregarMatafuegoForm"
          action={endpointsAPI.matafuegos.nuevo.action}
          method={endpointsAPI.matafuegos.nuevo.method}
          onSuccess={handleSuccess}
          onError={handleErrors}
          validateForm={validateForm}>
          <FormInput
            name="NroSerie"
            label="NroSerie"
            type="text"
            placeholder="Ingrese el número de serie"
            required={false}
            value={formData.NroSerie}
            onChange={onChange}
            error={errors.NroSerie}></FormInput>
          <FormInput
            name="Proveedor"
            label="Proveedor"
            type="text"
            placeholder="Ingrese el proveedor"
            required={false}
            value={formData.Proveedor}
            onChange={onChange}
            error={errors.Proveedor}></FormInput>
          <FormInput
            label="Fecha de Carga"
            placeholder="Ingrese la Fecha de Carga"
            type="date"
            name="FechaCarga"
            required={true}
            value={formData.FechaCarga.toISOString().split("T")[0]}
            onChange={onChange}
            error={errors.FechaCarga}></FormInput>
          <FormInput
            label="Fecha de Vencimiento"
            placeholder="Ingrese la Fecha de Vencimiento"
            type="date"
            name="FechaVencimiento"
            required={true}
            value={formData.FechaVencimiento.toISOString().split("T")[0]}
            onChange={onChange}
            error={errors.FechaVencimiento}></FormInput>
          <FormButtons
            setFormData={setFormData}
            initialState={intialState}
            formClear={cleanErrors}></FormButtons>
        </Form>
      </FormCard>
    </div>
  );
};
