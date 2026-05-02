import { Col, Row } from "react-bootstrap";
import FormInput from "../../src/Components/Form/FormInput";
import FormCard from "../../src/Components/Form/FormCard";
import React, { useState } from "react";
import FormButtons from "../../src/Components/Form/FormButtons";
import Form from "../../src/Components/Form/Form";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { endpointsAPI } from "../../src/Components/Routes/Enrouters";
import {
  VehiculoSchema,
  type VehiculoSchemaType,
} from "../../types/Vehiculo.schema";
import { formatZodErrors } from "../../src/Utils/Validation.utils";

export default function VehiculoAgregar() {
  const navigate = useNavigate();
  const initialState: VehiculoSchemaType = {
    Marca: "",
    Modelo: "",
    Anio: 0,
    Patente: "",
    Color: "",
    NumeroChasis: "",
    NumeroMotor: "",
    CantidadNeumaticos: 0,
    CantidadAuxilios: 0,
  };

  const [formData, setFormData] = useState<VehiculoSchemaType>(initialState);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const formCleanTextErrors = () => {
    setErrors({});
  };

  const handleSuccess = () => {
    Swal.fire({
      title: "Vehículo registrado con éxito",
      icon: "success",
      showCancelButton: true,
      confirmButtonText: "Aceptar y continuar",
      cancelButtonText: "Aceptar y volver al inicio",
    }).then((result) => {
      if (result.isConfirmed) {
        setFormData(initialState);
      } else {
        navigate("/");
      }
    });
  };

  const handleError = (errorMessage: unknown) => {
    Swal.fire({
      title: "Error al registrar el vehículo",
      text:
        errorMessage instanceof Error
          ? errorMessage.message
          : String(errorMessage),
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  };

  const ValidateForm = (): boolean => {
    const validationResult = VehiculoSchema.safeParse(formData);
    if (!validationResult.success) {
      const newErrors = formatZodErrors(validationResult.error);
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="container-fluid py-2">
      <FormCard
        title="Registrar Vehículo Nuevo"
        classNameCard="border-0 shadow-lg rounded-4 text-white"
        classNameHeader="fs-4 fw-bold text-white bg-transparent border-bottom border-secondary py-3 px-4"
        classNameBody="p-4 p-md-5"
        styleCard={{ backgroundColor: "#212529" }}>
        <Form
          name="vehiculoForm"
          method={endpointsAPI.vehiculos.nuevo.method}
          action={endpointsAPI.vehiculos.nuevo.action}
          validateForm={ValidateForm}
          onSuccess={handleSuccess}
          onError={handleError}>
          <div
            className="p-4 mb-4 rounded-4 border border-secondary"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.02)" }}>
            <h5
              className="fw-bold text-primary mb-4 pb-2 border-bottom border-secondary"
              style={{ opacity: 0.9 }}>
              <i className="bi bi-car-front me-2"></i> Información Principal
            </h5>

            <Row className="g-3">
              <Col xs={12} md={3}>
                <FormInput
                  label="Marca"
                  type="text"
                  name="Marca"
                  placeholder="Ej: Ford"
                  value={formData.Marca}
                  onChange={handleChange}
                  required={true}
                  error={errors.Marca}
                />
              </Col>
              <Col xs={12} md={3}>
                <FormInput
                  label="Modelo"
                  type="text"
                  name="Modelo"
                  placeholder="Ej: Ranger"
                  value={formData.Modelo}
                  onChange={handleChange}
                  required={true}
                  error={errors.Modelo}
                />
              </Col>
              <Col xs={12} md={2}>
                <FormInput
                  label="Año"
                  type="number"
                  name="Anio"
                  placeholder="Ej: 2024"
                  value={formData.Anio}
                  onChange={handleChange}
                  required={true}
                  error={errors.Anio}
                />
              </Col>
              <Col xs={12} md={2}>
                <FormInput
                  label="Patente"
                  type="text"
                  name="Patente"
                  placeholder="Ej: AB123CD"
                  value={formData.Patente}
                  onChange={handleChange}
                  required={true}
                  error={errors.Patente}
                />
              </Col>
              <Col xs={12} md={2}>
                <FormInput
                  label="Color"
                  type="text"
                  name="Color"
                  placeholder="Ej: Blanco"
                  value={formData.Color}
                  onChange={handleChange}
                  required={true}
                  error={errors.Color}
                />
              </Col>
            </Row>
          </div>

          <div
            className="p-4 mb-4 rounded-4 border border-secondary"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.02)" }}>
            <h5
              className="fw-bold text-primary mb-4 pb-2 border-bottom border-secondary"
              style={{ opacity: 0.9 }}>
              <i className="bi bi-gear me-2"></i> Información Técnica
            </h5>

            <Row className="g-3">
              <Col xs={12} md={6}>
                <FormInput
                  label="Número de Chasis"
                  type="text"
                  name="NumeroChasis"
                  placeholder="Ingrese el número de chasis"
                  value={formData.NumeroChasis}
                  onChange={handleChange}
                  required={true}
                  error={errors.NumeroChasis}
                />
              </Col>
              <Col xs={12} md={6}>
                <FormInput
                  label="Número de Motor"
                  type="text"
                  name="NumeroMotor"
                  placeholder="Ingrese el número de motor"
                  value={formData.NumeroMotor}
                  onChange={handleChange}
                  required={true}
                  error={errors.NumeroMotor}
                />
              </Col>
            </Row>
          </div>

          <div
            className="p-4 mb-5 rounded-4 border border-secondary"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.02)" }}>
            <h5
              className="fw-bold text-primary mb-4 pb-2 border-bottom border-secondary"
              style={{ opacity: 0.9 }}>
              <i className="bi bi-disc me-2"></i> Ruedas y Auxilios
            </h5>

            <Row className="g-3">
              <Col xs={12} md={6}>
                <FormInput
                  label="Cantidad de Neumáticos"
                  type="number"
                  name="CantidadNeumaticos"
                  placeholder="Ej: 4"
                  value={formData.CantidadNeumaticos}
                  onChange={handleChange}
                  required={true}
                  error={errors.CantidadNeumaticos}
                />
              </Col>
              <Col xs={12} md={6}>
                <FormInput
                  label="Cantidad de Auxilios"
                  type="number"
                  name="CantidadAuxilios"
                  placeholder="Ej: 1"
                  value={formData.CantidadAuxilios}
                  onChange={handleChange}
                  required={true}
                  error={errors.CantidadAuxilios}
                />
              </Col>
            </Row>
          </div>

          <div className="pt-3">
            <FormButtons
              setFormData={setFormData}
              initialState={initialState}
              formClear={formCleanTextErrors}
            />
          </div>
        </Form>
      </FormCard>
    </div>
  );
}
