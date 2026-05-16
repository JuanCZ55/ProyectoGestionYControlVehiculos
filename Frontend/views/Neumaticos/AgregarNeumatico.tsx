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
import { Row, Col } from "react-bootstrap"; // Importamos la grilla

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
      title: "Neumático registrado con éxito",
      icon: "success",
      confirmButtonText: "Aceptar y continuar",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(endpointFront.neumaticos.gestion.action);
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
        flexDirection: "column",
        paddingBlock: "2rem",
        minHeight: "90%",
      }}>
      <FormCard
        title="Registrar Neumático"
        classNameCard="rounded-4 text-white shadow-lg border border-secondary d-flex flex-column w-100 mx-auto"
        styleCard={{
          maxWidth: "950px",
          background: "linear-gradient(145deg, #1e2124 0%, #23272b 100%)",
          boxShadow: "0 1.5rem 3rem rgba(0,0,0,0.6)",
        }}
        classNameHeader="text-center fs-5 fw-bold border-bottom border-secondary py-3"
        classNameBody="p-3 p-sm-4">
        <form
          name="AgregarNeumaticoForm"
          onSubmit={handleSubmit}
          onError={onError}>
          <Row className="g-4">
            {/* CUADRITO 1: MITAD IZQUIERDA */}
            <Col xs={12} md={6}>
              <div
                className="p-3 rounded-4 border h-100"
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(255,255,255,0.1)",
                }}>
                <h6
                  className="fw-bold mb-3 pb-2 border-bottom d-flex align-items-center gap-2"
                  style={{
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "#62b5f0",
                    fontSize: "0.95rem",
                    textTransform: "uppercase",
                  }}>
                  <i className="bi bi-tag-fill"></i> Identificación
                </h6>

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
            </Col>

            {/* CUADRITO 2: MITAD DERECHA */}
            <Col xs={12} md={6}>
              <div
                className="p-3 rounded-4 border h-100"
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(255,255,255,0.1)",
                }}>
                <h6
                  className="fw-bold mb-3 pb-2 border-bottom d-flex align-items-center gap-2"
                  style={{
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "#62b5f0",
                    fontSize: "0.95rem",
                    textTransform: "uppercase",
                  }}>
                  <i className="bi bi-speedometer2"></i> Condición y Uso
                </h6>

                <ChecklistInput
                  name="Estandar"
                  label={getNeumatico.Estandar ? "Estandar" : "Recapado"}
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
                  label={
                    getNeumatico.DesgasteIrregular
                      ? "Con Desgaste Irregular"
                      : "Sin Desgaste Irregular"
                  }
                  value={getNeumatico.DesgasteIrregular!}
                  onChange={(value) =>
                    setNeumatico({ ...getNeumatico, DesgasteIrregular: value })
                  }
                  error={getErrors.DesgasteIrregular}
                />
              </div>
            </Col>
          </Row>

          <div className="pt-4">
            <FormButtons
              setFormData={setNeumatico}
              initialState={intialState}
              formClear={cleanErrors}
            />
          </div>
        </form>
      </FormCard>
    </div>
  );
};
