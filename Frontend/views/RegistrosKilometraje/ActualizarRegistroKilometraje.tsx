import Form from "../../src/Components/Form/Form";
import FormCard from "../../src/Components/Form/FormCard";
import FormInput from "../../src/Components/Form/FormInput";
import endpointsAPI, {
  endpointFront,
} from "../../src/Components/Routes/Enrouters";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import { getErrorMessage } from "../../src/Utils/Errors.utils";
import React, { useEffect, useState } from "react";
import {
  ApiControlKilometrajeParser,
  ControlKilometrajeSchema,
  type ControlKilometrajeSchemaType,
} from "../../types/ControlKilometraje.schema";
import { formatZodErrors } from "../../src/Utils/Validation.utils";
import FormButtons from "../../src/Components/Form/FormButtons";

export default function ActualizarRegistroKilometraje() {
  const navigate = useNavigate();
  const { id } = useParams();
  if (!id?.match("^[0-9]+$"))
    navigate(endpointFront.controlKilometraje.listar.action);

  const initialState: ControlKilometrajeSchemaType = {
    IdVehiculo: 0,
    IdRegistroKilometraje: parseInt(id!),
    Kilometraje: 0,
    FechaRegistro: new Date(),
  };
  const [initialFormData, setInitialFormData] =
    useState<ControlKilometrajeSchemaType>(initialState);

  const [formData, setFormData] =
    useState<ControlKilometrajeSchemaType>(initialState);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseFromApi = await fetch(
          endpointsAPI.controlKilometraje.buscarPorId.action(parseInt(id!)),
          {
            method: endpointsAPI.controlKilometraje.buscarPorId.method,
          },
        );
        if (!responseFromApi.ok) throw new Error(await responseFromApi.text());
        const data = await responseFromApi.json();
        console.log(data);

        const parsedData = ApiControlKilometrajeParser.parse(data);
        setInitialFormData(parsedData);
        setFormData(parsedData);
      } catch (error) {
        handleError(error);
      }
    };
    fetchData();
  }, [id]);

  const ValidateForm = (): boolean => {
    const validateFromZod = ControlKilometrajeSchema.safeParse(formData);
    if (!validateFromZod.success) {
      const newErrors = formatZodErrors(validateFromZod.error);
      setErrors(newErrors);
      return false;
    } else {
      setErrors({});
      return true;
    }
  };
  const formCleanTextErrors = () => {
    setErrors({});
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
  const handleError = (errorMessage: unknown) => {
    Swal.fire({
      title: "Error al registrar el kilometraje",
      text: getErrorMessage(errorMessage, "kilometraje"),
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
      {
        <FormCard
          title="Actualizar Kilometraje"
          classNameCard="mb-1 bg-dark text-white  rounded-5 "
          classNameHeader="fs-1 text-white text-center border-0 rounded-5"
          styleCard={{
            maxWidth: "50%",
            padding: "20px",
          }}
          styleHeader={{ fontFamily: "serif" }}
          classNameBody="fs-5 p-1">
          <div></div>
          {
            <Form
              name="vehiculoForm"
              method={endpointsAPI.controlKilometraje.editar.method}
              action={endpointsAPI.controlKilometraje.editar.action(
                formData.IdRegistroKilometraje!,
              )}
              validateForm={ValidateForm}
              onSuccess={handleSuccess}
              onError={handleError}>
              <input
                type="hidden"
                name="IdVehiculo"
                value={formData.IdVehiculo}></input>
              <input
                type="hidden"
                name="FechaRegistro"
                value={
                  formData.FechaRegistro
                    ? formData.FechaRegistro.toISOString()
                    : ""
                }></input>

              <FormInput
                label="Kilometraje Actual"
                type="number"
                name="Kilometraje"
                placeholder="Kilometraje Actual"
                value={formData.Kilometraje}
                onChange={handleChange}
                required={true}
                error={errors.Kilometraje}></FormInput>
              <FormButtons
                initialState={initialFormData}
                setFormData={setFormData}
                formClear={formCleanTextErrors}></FormButtons>
            </Form>
          }
        </FormCard>
      }
    </div>
  );
}
