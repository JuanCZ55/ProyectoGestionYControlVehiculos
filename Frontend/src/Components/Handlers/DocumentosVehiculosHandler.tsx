import { Button } from "react-bootstrap";
import Enrouters, { endpointsAPI } from "../Routes/Enrouters";
import { useState } from "react";
import "../css/scrollbar.css";
import Switch from "../Styled/StyledSwitch";
import Swal from "sweetalert2";
import { Toast } from "../../Utils/Toast";

interface Documento {
  idDocumento?: number;
  tipo?: string;
  fechaVencimiento?: string;
  urlDocumento?: string;
  estado?: boolean;
}

interface DocumentosVehiculosHandlerProps {
  docs: Documento[];
  onCargar?: (tipo: string, idDocumentoViejo?: number) => void;
  onSuccess?: () => void;
}

export default function DocumentosVehiculosHandler({
  docs,
  onCargar,
  onSuccess,
}: DocumentosVehiculosHandlerProps) {
  const [mostrarActivos, setMostrarActivos] = useState(true);
  const tiposRequeridos = [
    { tipo: "Tarjeta Verde", label: "Tarjeta Verde" },
    { tipo: "Frente Poliza", label: "Frente Poliza" },
    { tipo: "Titulo", label: "Titulo" },
  ];
  console.log("DOCS: " + docs.forEach((doc) => console.log(doc)));

  // Verifica si existen los documentos requeridos
  const tieneTipo = (tipo: string) =>
    docs.some(
      (doc: Documento) => doc.tipo?.toLowerCase() === tipo.toLowerCase(),
    );
  // Funcion para cargar el documento y abrirlo en una nueva pestaña
  const openDocument = async (idDocumento: number) => {
    const response = await fetch(
      Enrouters.documentos.cargarDocumento.action(idDocumento),
      { method: Enrouters.documentos.cargarDocumento.method },
    );
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
  };
  const validateDelete = (tipo: string, idDocumento: number) => {
    Swal.fire({
      title: `Va a eliminar un documento  - Tipo de Documento: ${tipo}`,
      icon: "warning",
      input: "text",
      inputLabel:
        "Ingrese 'Confirmar' para eliminar (esta accion no tiene vuelta atras)",
      inputPlaceholder: "Confirmar",
      inputValidator: (value) => {
        if (value !== "Confirmar") {
          return "Debe ingresar 'Confirmar' para eliminar el registro";
        }
      },
      confirmButtonText: "Eliminar",
      confirmButtonColor: "#ca1212ff",
      showCancelButton: true,
      cancelButtonColor: "#0d6efd",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isDismissed) {
        Swal.fire(
          "Se cancelo la operacion",
          "No se elimino el documento",
          "info",
        );
        return;
      }
      if (result.isConfirmed) {
        await deleteDocument(idDocumento);
        return;
      }
    });
  };
  const deleteDocument = async (idDocumento: number) => {
    try {
      const responseFromApi = await fetch(
        endpointsAPI.documentos.eliminar.action(idDocumento),
        { method: endpointsAPI.documentos.eliminar.method },
      );
      if (!responseFromApi.ok) {
        throw new Error("No se elimino el documento");
      }
      Toast.fire({
        icon: "success",
        title: "Documento Eliminado con Exito",
      });
      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      Toast.fire({
        icon: "error",
        title: error instanceof Error ? error.message : "Ocurrio un error",
      });
    }
  };
  return (
    <div className="d-flex flex-column gap-2 ">
      <div className="d-flex flex-row gap-2 mb-2">
        <div style={{ width: "15%" }}>
          <span
            className={
              mostrarActivos ? "fw-bold text-success" : "fw-bold text-danger"
            }>
            {mostrarActivos ? "Mostrar Activos" : "Mostrar Inactivos"}
          </span>
        </div>
        <Switch
          checked={mostrarActivos}
          onChange={() => setMostrarActivos((prev) => !prev)}
        />
      </div>
      <div className="d-flex flex-column gap-2 contenedor-hijo custom-scrollbar">
        {/* Documentos existentes */}
        {docs.length !== 0 &&
          docs
            .filter((doc) =>
              mostrarActivos ? doc.estado !== false : doc.estado === false,
            )
            .map((doc: Documento, idx: number) => {
              let vencido = false;
              if (doc.fechaVencimiento) {
                const fechaVenc = new Date(doc.fechaVencimiento);
                const hoy = new Date();
                vencido = fechaVenc <= hoy;
              }
              return (
                <div
                  key={doc.idDocumento ?? idx}
                  className="d-flex align-items-center border rounded p-2 gap-3 justify-content-between">
                  <div className="d-flex flex-column">
                    <span>
                      <strong>{doc.tipo}</strong>
                    </span>
                    <span>
                      <strong>Vencimiento:</strong> {doc.fechaVencimiento}
                    </span>
                  </div>
                  <div>
                    {vencido && (
                      <span className="text-danger">
                        DOCUMENTO VENCIDO
                        {doc.estado !== false && (
                          <Button
                            variant="success"
                            size="sm"
                            className="ms-2"
                            onClick={() =>
                              onCargar && onCargar(doc.tipo!, doc.idDocumento)
                            }>
                            Cargar Nuevo
                          </Button>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="d-flex gap-3">
                    <Button
                      style={{ marginRight: "5px" }}
                      as="a"
                      variant="primary"
                      onClick={() => {
                        if (doc.idDocumento) {
                          openDocument(doc.idDocumento);
                        }
                      }}>
                      Abrir
                    </Button>
                    <Button
                      style={{ marginRight: "5px" }}
                      as="a"
                      variant="danger"
                      onClick={() => {
                        if (doc.idDocumento) {
                          validateDelete(doc.tipo ?? "", doc.idDocumento);
                        }
                      }}>
                      Eliminar
                    </Button>
                    {/* <Button
                    variant="primary"
                    href={doc.urlDocumento}
                    target="_blank"
                    size="sm"
                  >
                    Ir a Ubicación
                  </Button> */}
                  </div>
                </div>
              );
            })}
      </div>
      {/* Documentos requeridos no presentes */}
      {mostrarActivos && docs.length > 0
        ? tiposRequeridos.map((req) =>
            !tieneTipo(req.tipo) ? (
              <div
                key={req.tipo}
                className="d-flex align-items-center border rounded p-2 gap-3 bg-light text-secondary justify-content-between">
                <span>
                  <strong>{req.label}:</strong> No cargada
                </span>
                <Button
                  style={{ marginRight: "5px" }}
                  variant="success"
                  size="sm"
                  onClick={() => onCargar && onCargar(req.tipo)}>
                  Cargar
                </Button>
              </div>
            ) : null,
          )
        : mostrarActivos &&
          tiposRequeridos.map((req) => (
            <div
              key={req.tipo}
              className="d-flex align-items-center border rounded p-2 gap-3 bg-light text-secondary justify-content-between">
              <span>
                <strong>{req.label}:</strong> No cargada
              </span>
              <Button
                variant="success"
                size="sm"
                onClick={() => onCargar && onCargar(req.tipo)}>
                Cargar
              </Button>
            </div>
          ))}

      {/* Agregar documentación adicional */}
      {mostrarActivos && (
        <div className="d-flex align-items-center border rounded p-2 gap-3 bg-light text-secondary justify-content-between">
          <span>
            <strong>Agregar documentación adicional</strong>
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onCargar && onCargar("")}>
            Agregar
          </Button>
        </div>
      )}
    </div>
  );
}
