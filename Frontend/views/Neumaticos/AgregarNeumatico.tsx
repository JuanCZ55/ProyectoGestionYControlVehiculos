import {
  NeumaticoSchema,
  type NeumaticoType,
} from "../../types/Neumatico.schema";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../src/Utils/Errors.utils";
import FormCard from "../../src/Components/Form/FormCard";
import {
  endpointFront,
  endpointsAPI,
} from "../../src/Components/Routes/Enrouters";
import { formatZodErrors } from "../../src/Utils/Validation.utils";
import FormInput from "../../src/Components/Form/FormInput";
import ChecklistInput from "../../src/Components/Form/ChecklistInput";
import FormButtons from "../../src/Components/Form/FormButtons";
import { useEffect, useState } from "react";

export const AgregarNeumatico = () => {
  const navigate = useNavigate();

  const intialState: NeumaticoType = {
    NroSerie: 0,
    Marca: "",
    Medida: "",
    Estandar: false,
    KmRodados: 0,
    DesgasteIrregular: false,
    Estado: true,
    FechaColocacion: null,
  };
  const [getNeumatico, setNeumatico] = useState<NeumaticoType>(intialState);
  const [getErrors, setErrors] = useState<{ [key: string]: string }>({});
  const cleanErrors = () => {
    setErrors({});
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const finalValue =
      type === "checkbox"
        ? checked
        : name == "NroSerie" || name == "KmRodados"
          ? parseInt(value) || 0
          : value;

    setNeumatico({
      ...getNeumatico,
      [name]: finalValue,
    });
  };
  useEffect(() => {
    console.log(getNeumatico);
  }, [getNeumatico]);

  const validateForm = (): boolean => {
    const validateFromZod = NeumaticoSchema.safeParse(getNeumatico);
    if (!validateFromZod.success) {
      const newErrors = formatZodErrors(validateFromZod.error);
      setErrors(newErrors);
      return false;
    } else {
      setErrors({});
      return true;
    }
  };
  const onSuccess = () => {
    Swal.fire({
      title: "Kilometraje registrado con éxito",
      icon: "success",
      confirmButtonText: "Aceptar y continuar",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(endpointFront.neumaticos.gestion.action);
        return;
      } else {
        return;
      }
    });
  };
  const onError = (errorMessage: unknown) => {
    Swal.fire({
      title: "Error al registrar el neumático",
      text: getErrorMessage(errorMessage, "neumatico"),
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validateFormResult = validateForm();
    if (!validateFormResult) {
      return;
    }
    const dataParaBackend = {
      IdNeumatico: getNeumatico.IdNeumatico,
      NroSerie: getNeumatico.NroSerie,
      Marca: getNeumatico.Marca,
      Medida: getNeumatico.Medida,
      Estandar: getNeumatico.Estandar,
      KmRodados: getNeumatico.KmRodados,
      DesgasteIrregular: getNeumatico.DesgasteIrregular,
      Estado: getNeumatico.Estado,
    };
    console.log("Datos para backend:", getNeumatico);
    try {
      const response = await fetch(endpointsAPI.neumaticos.nuevo.action, {
        method: endpointsAPI.neumaticos.nuevo.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataParaBackend),
      });
      if (response.ok) onSuccess();
    } catch (error) {
      onError(error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingBlock: "0.01rem", // ← reducido de 2rem
        minHeight: "90%", // ← ayuda a centrar sin empujar
      }}>
      <FormCard
        title="Registrar Neumatico"
        classNameCard="rounded-5 text-white shadow-lg border border-secondary"
        styleCard={{
          maxWidth: "650px", // ← un poco más angosto (antes 700)
          background: "linear-gradient(145deg, #1e2124 0%, #23272b 100%)",
          boxShadow: "0 1.5rem 3rem rgba(0,0,0,0.6)",
        }}
        classNameHeader="text-center fs-5 fw-bold border-bottom border-secondary py-2"
        classNameBody="p-3 p-sm-4" // ← reducido de p-4 p-sm-5
      >
        <form
          name="AgregarNeumaticoForm"
          onSubmit={handleSubmit}
          onError={onError}>
          {/* Sección Identificación */}
          <div
            className="p-3 mb-3 rounded-4 border" // ← p-4 → p-3, mb-4 → mb-3
            style={{
              backgroundColor: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.1)",
            }}>
            <h5
              className="fw-bold mb-3 pb-2 border-bottom d-flex align-items-center gap-2"
              style={{
                borderColor: "rgba(255,255,255,0.1)",
                color: "#62b5f0",
                fontSize: "1rem", // ← un poco más pequeño
              }}>
              <i className="bi bi-tag-fill"></i> Identificación del Neumático
            </h5>

            <FormInput
              name="NroSerie"
              label="NroSerie"
              type="text"
              placeholder="Ingrese el número de serie"
              required={false}
              value={getNeumatico.NroSerie}
              onChange={onChange}
              error={getErrors.NroSerie}
            />
            <FormInput
              name="Marca"
              label="Marca"
              type="text"
              placeholder="Ingrese la marca"
              required={false}
              value={getNeumatico.Marca}
              onChange={onChange}
              error={getErrors.Marca}
            />
            <FormInput
              name="Medida"
              label="Medida"
              type="text"
              placeholder="Ingrese la medida"
              required={false}
              value={getNeumatico.Medida}
              onChange={onChange}
              error={getErrors.Medida}
            />
          </div>

          {/* Sección Condición y Uso */}
          <div
            className="p-3 mb-3 rounded-4 border"
            style={{
              backgroundColor: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.1)",
            }}>
            <h5
              className="fw-bold mb-3 pb-2 border-bottom d-flex align-items-center gap-2"
              style={{
                borderColor: "rgba(255,255,255,0.1)",
                color: "#62b5f0",
                fontSize: "1rem",
              }}>
              <i className="bi bi-speedometer2"></i> Condición y Uso
            </h5>

            <ChecklistInput
              name="Estandar"
              label="Estandar"
              value={getNeumatico.Estandar!}
              onChange={(value) =>
                setNeumatico({ ...getNeumatico, Estandar: value })
              }
              error={getErrors.Estandar}
            />
            <FormInput
              name="KmRodados"
              label="Km Rodados"
              type="text"
              placeholder="Ingrese el Km Rodados"
              required={false}
              value={getNeumatico.KmRodados}
              onChange={onChange}
              error={getErrors.KmRodados}
            />
            <ChecklistInput
              name="DesgasteIrregular"
              label="Desgaste Irregular"
              value={getNeumatico.DesgasteIrregular!}
              onChange={(value) =>
                setNeumatico({ ...getNeumatico, DesgasteIrregular: value })
              }
              error={getErrors.DesgasteIrregular}
            />
          </div>

          <FormButtons
            setFormData={setNeumatico}
            initialState={intialState}
            formClear={cleanErrors}
          />
        </form>
      </FormCard>
    </div>
  );
};
