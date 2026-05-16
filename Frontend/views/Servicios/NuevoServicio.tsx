import { useEffect, useState } from "react";
import FormCard from "../../src/Components/Form/FormCard";
import FormButtons from "../../src/Components/Form/FormButtons";
import ComboBoxBrowser from "../../src/Components/FormBuscador/ComboBoxBrowser";
import Checklistinput from "../../src/Components/Form/ChecklistInput";
import { endpointsAPI } from "../../src/Components/Routes/Enrouters";

import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import FormInput from "../../src/Components/Form/FormInput";
import { Modal } from "react-bootstrap";

export default function NuevoServicio() {
  const navigate = useNavigate();
  const initialState = {
    IdVehiculo: 0,
    aceite: false,
    filtroDeAceite: false,
    filtroDeAire: false,
    filtroDeCombustible: false,
    bombaCombustible: false,
    correaPolyV: false,
    correaDentada: false,
    alineoBalanceo: false,
    bombaAgua: false,
    bombaAceite: false,
    bujias: false,
    kmService: 0,
    excepcional: false,
    servicioExcepcional: "",
    proveedor: "",
    detalle: "",
    realizado: false,
    estado: true,
  };

  const [formData, setFormData] = useState(initialState);
  const [showModal, setShowModal] = useState(false);
  const [detalleModal, setDetalleModal] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const formCleanTextErrors = () => {
    setErrors({});
    setFormData(initialState);
  };
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);
  useEffect(() => {}, [detalleModal]);
  const handleSuccess = () => {
    Swal.fire({
      title: "Service registrado con éxito",
      icon: "success",
      showCancelButton: true,
      confirmButtonText: "Aceptar y continuar",
      cancelButtonText: "Aceptar y volver al inicio",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.reload();
      } else {
        navigate("/");
      }
    });
  };
  const handleError = (errorMessage: unknown) => {
    Swal.fire({
      title: "Error al registrar el service",
      text:
        errorMessage instanceof Error
          ? errorMessage.message
          : String(errorMessage),
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  };
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (formData.IdVehiculo === 0) {
      newErrors.IdVehiculo = "Selecciona un vehículo";
    }

    return newErrors;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      if (validationErrors.IdVehiculo) {
        handleError(validationErrors.IdVehiculo);
      }
      return;
    }
    const dataParaBackend = {
      IdVehiculo: formData.IdVehiculo,
      Aceite: formData.aceite,
      FiltroDeAceite: formData.filtroDeAceite,
      FiltroDeAire: formData.filtroDeAire,
      FiltroDeCombustible: formData.filtroDeCombustible,
      BombaCombustible: formData.bombaCombustible,
      CorreaPolyV: formData.correaPolyV,
      CorreaDentada: formData.correaDentada,
      AlineoBalanceo: formData.alineoBalanceo,
      BombaAgua: formData.bombaAgua,
      BombaAceite: formData.bombaAceite,
      Bujias: formData.bujias,
      KmService: formData.kmService,
      Excepcional: false,
      ServicioExcepcional: "",
      Proveedor: formData.proveedor,
      Detalle: formData.detalle,
      Realizado: false,
      Estado: true,
      Fecha: new Date().toISOString().split("T")[0],
    };
    try {
      const response = await fetch(endpointsAPI.mantenimiento.nuevo.action, {
        method: endpointsAPI.mantenimiento.nuevo.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataParaBackend),
      });
      if (response.ok) {
        handleSuccess();
      } else {
        const errorText = await response.text();
        const objectTextError = JSON.parse(errorText);
        console.log(objectTextError);
        throw new Error(objectTextError.message || "Error desconocido");
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <>
      <FormCard
        title="CHECKLIST DE VEHICULO"
        classNameCard="bg-dark text-white rounded-4 shadow-lg p-4 w-100">
        <form name="checklistForm" onSubmit={handleSubmit}>
          <div className="mb-5 w-50 text-center mx-auto">
            <ComboBoxBrowser
              apiUrl={endpointsAPI.vehiculos.buscarPorPatenteLike.action("")}
              apiMethod={endpointsAPI.vehiculos.buscarPorPatenteLike.method}
              onEntitySelect={(vehiculo) => {
                console.log("Vehículo seleccionado:", vehiculo);
                setFormData({
                  ...formData,
                  IdVehiculo: vehiculo ? Number(vehiculo.idVehiculo) : 0,
                });
              }}
              placeholder="Busqueda por Patente"
              name="IdVehiculo"
            />
            {errors.IdVehiculo && (
              <div className="text-danger">{errors.IdVehiculo}</div>
            )}
            {/**DIV EN ORDEN OJ */}
          </div>
          <div className="d-flex justify-content-between w-100 mx-auto gap-3">
            <Checklistinput
              label="Cambio de Aceite"
              name="Aceite"
              value={formData.aceite}
              onChange={(value) => setFormData({ ...formData, aceite: value })}
            />
            <Checklistinput
              label="Filtro de Aceite"
              name="FiltroDeAceite"
              value={formData.filtroDeAceite}
              onChange={(value) =>
                setFormData({ ...formData, filtroDeAceite: value })
              }
            />
            <Checklistinput
              label="Bomba de Aceite"
              name="BombaAceite"
              value={formData.bombaAceite}
              onChange={(value) =>
                setFormData({ ...formData, bombaAceite: value })
              }
            />
          </div>
          {/**DIV EN ORDEN OK */}
          <div className="d-flex justify-content-between w-100 mx-auto gap-3">
            <Checklistinput
              label="Filtro de Aire"
              name="FiltroDeAire"
              value={formData.filtroDeAire}
              onChange={(value) =>
                setFormData({ ...formData, filtroDeAire: value })
              }
            />
            <Checklistinput
              label="Filtro de Combustible"
              name="FiltroDeCombustible"
              value={formData.filtroDeCombustible}
              onChange={(value) =>
                setFormData({ ...formData, filtroDeCombustible: value })
              }
            />
            <Checklistinput
              label="Bomba de Combustible"
              name="BombaCombustible"
              value={formData.bombaCombustible}
              onChange={(value) =>
                setFormData({ ...formData, bombaCombustible: value })
              }
            />
          </div>
          <div className="d-flex justify-content-between w-100 mx-auto gap-3">
            <Checklistinput
              label="Alienación y Balanceo"
              name="AlineoBalanceo"
              value={formData.alineoBalanceo}
              onChange={(value) =>
                setFormData({ ...formData, alineoBalanceo: value })
              }
            />
            <Checklistinput
              label="Cambio de Bomba de Agua"
              name="BombaAgua"
              value={formData.bombaAgua}
              onChange={(value) =>
                setFormData({ ...formData, bombaAgua: value })
              }
            />
            <Checklistinput
              label="Correa Poly V"
              name="CorreaPolyV"
              value={formData.correaPolyV}
              onChange={(value) =>
                setFormData({ ...formData, correaPolyV: value })
              }
            />
          </div>
          <div className="d-flex justify-content-between w-100 mx-auto gap-3">
            <Checklistinput
              label="Correa Dentada"
              name="CorreaDentada"
              value={formData.correaDentada}
              onChange={(value) =>
                setFormData({ ...formData, correaDentada: value })
              }
            />
            <Checklistinput
              label="Cambio de Bujías"
              name="Bujias"
              value={formData.bujias}
              onChange={(value) => setFormData({ ...formData, bujias: value })}
            />
            <Checklistinput
              label="Agregar Detalle"
              name="Detalle"
              value={showModal}
              onChange={() => openModal()}
              style={{
                border:
                  detalleModal == "" ? "1px solid orange" : "1px solid #0084ff",
              }}
            />
          </div>
          <div className="row w-100 mx-auto">
            <div className="col-md-6">
              <FormInput
                type="text"
                label="Kilometraje del Servicio"
                name="KmService"
                placeholder="Kilometraje del Servicio"
                value={formData.kmService}
                className="flex-grow-1"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    kmService: Number(e.target.value),
                  });
                }}
                required={true}
              />
            </div>
            <div className="col-md-6">
              <FormInput
                type="text"
                label="Proveedor"
                name="Proveedor"
                placeholder="Proveedor"
                value={formData.proveedor}
                className="flex-grow-1"
                onChange={(e) =>
                  setFormData({ ...formData, proveedor: e.target.value })
                }
                required={false}
              />
            </div>
          </div>
          <FormButtons
            setFormData={setFormData}
            initialState={initialState}
            formClear={formCleanTextErrors}
            disabledSubmitButton={false}
          />
        </form>
      </FormCard>
      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Detalle del Servicio</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <textarea
            className="form-control"
            rows={10}
            cols={100}
            value={detalleModal}
            onChange={(e) => setDetalleModal(e.target.value)}></textarea>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={closeModal}>
            Cerrar
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setFormData({ ...formData, detalle: detalleModal });
              closeModal();
              Swal.fire({
                title: "Detalle agregado al servicio",
                icon: "success",
              });
            }}>
            Guardar Detalle
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
