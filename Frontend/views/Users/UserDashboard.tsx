import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Modal, Button } from "react-bootstrap";
import FormCard from "../../src/Components/Form/FormCard";
import endpointsAPI from "../../src/Components/Routes/Enrouters";
import { getUserFromToken } from "../../src/Utils/Auth";
import Swal from "sweetalert2";
import {
  PersonaSchemeValidator,
  type PersonaType,
  type UsuarioType,
} from "../../types/Usuario.schema";
import { formatZodErrors } from "../../src/Utils/Validation.utils";
import { getErrorMessage } from "../../src/Utils/Errors.utils";

// Función auxiliar para formatear la fecha a YYYY-MM-DD (Requerido por <input type="date">)
const formatDateForInput = (dateValue: Date | string | undefined) => {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

export function UserDashboard() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userId, setUserId] = useState<number>(0);
  const [usuario, setUsuario] = useState<UsuarioType | null>(null);

  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);
  const [showGmailModal, setShowGmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState<string>("");
  const [validEmail, setValidEmail] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // Estado editable para el formulario
  const [persona, setPersona] = useState<PersonaType>({
    idPersona: 0,
    nombre: "",
    apellido: "",
    dni: 0,
    fechaNac: new Date(),
    estado: false,
  });

  // 1. Agregamos un estado para controlar el mensaje de error visual
  const [gmailError, setGmailError] = useState<string>("");

  // 2. Creamos una función exclusiva para manejar los cambios del correo
  const handleGmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoValor = e.target.value;

    // Tu patrón exacto de C#
    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|gob|com\.[a-z]{2}|gob\.[a-z]{2})$/;

    // Actualizamos el estado del usuario (¡No de la persona!)
    setNewEmail(nuevoValor);

    // Evaluamos el patrón: si no pasa, mostramos error. Si pasa, lo limpiamos.
    if (!emailRegex.test(nuevoValor)) {
      setGmailError("El correo debe ser válido (ej: nombre@gmail.com)");
      setValidEmail(false);
    } else {
      setGmailError("");
      setValidEmail(true);
    }
  };

  useEffect(() => {
    const user = getUserFromToken();
    if (user?.sub != null) {
      const parsed = parseInt(user.sub.toString());
      setUserId(parsed);

      if (parsed > 0) {
        setAvatarUrl(
          `${endpointsAPI.usuarios.getAvatar.action(parsed)}?t=${Date.now()}`,
        );
        setImageError(false);
      }

      const buscarUsuario = async () => {
        try {
          const responseFromApi = await fetch(
            endpointsAPI.usuarios.getUsuario.action(parsed),
            {
              method: endpointsAPI.usuarios.getUsuario.method,
            },
          );
          if (!responseFromApi.ok)
            throw new Error(await responseFromApi.text());

          const dataFromApi = await responseFromApi.json();
          setUsuario(dataFromApi);
          setNewEmail(dataFromApi.gmail);
          // Llenamos el estado editable con los datos recién traídos de la BD
          if (dataFromApi.persona) {
            setPersona(dataFromApi.persona);
          }
        } catch (error) {
          console.error("Error al cargar usuario", error);
        }
      };
      buscarUsuario();
    }
  }, []);

  const handleClosePersonaModal = () => {
    setShowPersonaModal(false);
    setErrors({});
    setPersona(usuario!.persona!);
  };
  const handleShowPersonaModal = () => setShowPersonaModal(true);
  const handleCloseGmailModal = () => setShowGmailModal(false);
  const handleShowGmailModal = () => setShowGmailModal(true);

  // ESTILOS ADAPTADOS AL DARK MODE
  const cardStyles = {
    borderRadius: "15px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    backgroundColor: "#212529", // Fondo oscuro de tarjeta
    height: "100%",
  };

  const headerStyles = {
    backgroundColor: "transparent",
    color: "white",
    fontWeight: "bold",
    textAlign: "center" as const,
    padding: "1.5rem 1rem 0.5rem",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  };

  const bodyStyles = {
    backgroundColor: "transparent",
    color: "#e9ecef",
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmitEmail = async () => {
    try {
      const response = await fetch(
        endpointsAPI.usuarios.cambiarEmail.action(userId),
        {
          method: endpointsAPI.usuarios.cambiarEmail.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gmail: newEmail }),
        },
      );
      if (!response.ok) {
        let errorMessage = await response.text();
        const errorJSON = JSON.parse(errorMessage);
        if (errorJSON.mensaje) {
          errorMessage = errorJSON.mensaje;
        }
        console.log(errorMessage);
        throw new Error(errorMessage);
      }

      // Si el fetch sale bien, cerramos el modal y avisamos
      usuario!.gmail = newEmail;
      handleCloseGmailModal();
      Swal.fire("Éxito", "Correo actualizado", "success");
    } catch (error) {
      setNewEmail(usuario!.gmail!);
      handleCloseGmailModal();
      handleError(error);
    }
  };

  const handleChangePassword = () => {
    Swal.fire({
      title: "Cambiar Contraseña",
      html: `
      <input type="password" id="pass1" class="swal2-input" placeholder="Nueva contraseña">
      <input type="password" id="pass2" class="swal2-input" placeholder="Repetir contraseña">
    `,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      focusConfirm: false,

      preConfirm: () => {
        const pass1 = (document.getElementById("pass1") as HTMLInputElement)
          .value;
        const pass2 = (document.getElementById("pass2") as HTMLInputElement)
          .value;

        // EL PATRÓN REGEX MAGICO
        const passwordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

        if (!pass1 || !pass2) {
          Swal.showValidationMessage("Por favor completa ambos campos");
          return false;
        }

        // Evaluamos la contraseña contra el patrón
        if (!passwordRegex.test(pass1)) {
          Swal.showValidationMessage(
            "La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo especial",
          );
          return false;
        }

        if (pass1 !== pass2) {
          Swal.showValidationMessage("Las contraseñas no coinciden");
          return false;
        }

        return pass1;
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const newPassword = result.value;

        try {
          const response = await fetch(
            endpointsAPI.usuarios.cambiarPassword.action(userId),
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ newPassword: newPassword }),
            },
          );

          if (!response.ok) {
            const messageError = await response.text();
            const errorMessage = JSON.parse(messageError);

            if (errorMessage.message) {
              throw new Error(errorMessage.message);
            }
            throw new Error(errorMessage);
          }
          if (response.status === 204) {
            Swal.fire(
              "¡Éxito!",
              "Tu contraseña ha sido actualizada.",
              "success",
            );
            return;
          }
          Swal.fire("¡Éxito!", "Tu contraseña ha sido actualizada.", "success");
        } catch (error) {
          Swal.fire(
            "Error",
            `No se pudo actualizar la contraseña. ${error}`,
            "error",
          );
          console.log(error);
        }
      }
    });
  };

  const handlePersonaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    // Manejo seguro para que la fecha no explote si se borra en el input
    const finalValue =
      type === "date"
        ? value
          ? new Date(value)
          : new Date()
        : name === "dni"
          ? parseInt(value) || 0
          : value;
    setPersona({ ...persona, [name]: finalValue });
  };
  const validateForm = (): boolean => {
    const validationResult = PersonaSchemeValidator.safeParse(persona);
    if (!validationResult.success) {
      const newErrors = formatZodErrors(validationResult.error);
      setErrors(newErrors);
      console.log(newErrors);
      Swal.fire({
        title: "Error al guardar la persona",
        text: Object.values(newErrors)[0],
        icon: "error",
        confirmButtonText: "Aceptar",
      });
      return false;
    } else {
      setErrors({});
      return true;
    }
  };
  // Función lista para que agregues tu fetch PUT/POST para guardar la persona
  const handleGuardarPersona = async () => {
    try {
      if (!validateForm()) return;
      const fechaCruda = persona.fechaNac as any;
      const fechaFormateada =
        typeof fechaCruda === "string"
          ? fechaCruda.split("T")[0]
          : fechaCruda.toISOString().split("T")[0];
      const payload = {
        ...persona,
        fechaNac: fechaFormateada, // "YYYY-MM-DD" estricto
      };
      const response = await fetch(
        endpointsAPI.persona.actualizarPersona.action(persona.idPersona),
        {
          method: endpointsAPI.persona.actualizarPersona.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) {
        let errorMessage = await response.text();
        const errorJSON = JSON.parse(errorMessage);
        if (errorJSON.message) {
          errorMessage = errorJSON.message;
        }
        throw new Error(errorMessage);
      }
      // Si el fetch sale bien, cerramos el modal y avisamos
      handleClosePersonaModal();
      Swal.fire("Éxito", "Datos personales actualizados", "success");

      // Opcional: Actualizar el estado visual del usuario
      if (usuario) {
        setUsuario({ ...usuario, persona: persona });
      }
    } catch (error) {
      handleClosePersonaModal();
      handleError(error);
      setPersona(usuario!.persona!);
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (userId <= 0) {
      Swal.fire(
        "Espera",
        "Cargando datos del usuario, intenta de nuevo.",
        "warning",
      );
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
    setImageError(false);

    const formData = new FormData();
    formData.append("Avatar", file);

    try {
      const response = await fetch(
        endpointsAPI.usuarios.actualizarAvatar.action(userId),
        {
          method: endpointsAPI.usuarios.actualizarAvatar.method,
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error("No se pudo subir la imagen " + response.status);
      }

      if (response.status === 204) {
        handleSuccess("Imagen subida con éxito al servidor");
        return;
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleError = (error: unknown) => {
    Swal.fire({
      title: "Ocurrió un error: ",
      text: error instanceof Error ? error.message : "Error inesperado",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  };

  const handleSuccess = (mensaje: string) => {
    Swal.fire({
      title: mensaje,
      icon: "success",
      confirmButtonText: "Aceptar",
    });
  };

  return (
    <div className="container mt-4">
      {/* SECCIÓN DEL AVATAR */}
      <div className="d-flex flex-column align-items-center justify-content-center mb-5">
        <div
          onClick={handleAvatarClick}
          className="rounded-circle bg-dark d-flex justify-content-center align-items-center text-primary mb-2 position-relative"
          style={{
            width: "150px",
            height: "150px",
            fontSize: "4rem",
            border: "4px solid rgba(13, 110, 253, 0.3)", // Borde azul sutil estilo premium
            boxShadow: "0 0 20px rgba(13, 110, 253, 0.15)", // Resplandor azul
            cursor: "pointer",
            overflow: "hidden",
            transition: "all 0.3s ease",
          }}
          title="Haz clic para cambiar tu foto de perfil"
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>
          {avatarUrl && !imageError ? (
            <img
              src={avatarUrl}
              alt="Avatar del usuario"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={() => setImageError(true)}
            />
          ) : (
            <i className="bi bi-person"></i>
          )}
        </div>
        <h3 className="fw-bold mt-2 text-white">Mi Perfil</h3>
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>

      {/* SECCIÓN DE LAS TARJETAS */}
      <div className="row justify-content-center g-4">
        {/* CARD 1: DATOS DE LA PERSONA */}
        <div className="col-12 col-md-5">
          <FormCard
            title="Datos de la Persona"
            styleCard={cardStyles}
            styleHeader={headerStyles}
            styleBody={bodyStyles}>
            <div className="d-flex flex-column justify-content-between h-100 p-2">
              <ul
                className="list-group list-group-flush mb-4 rounded"
                style={{ overflow: "hidden" }}>
                <li className="list-group-item bg-transparent text-light border-secondary">
                  <strong className="text-white">Nombre:</strong>{" "}
                  {usuario?.persona?.nombre}
                </li>
                <li className="list-group-item bg-transparent text-light border-secondary">
                  <strong className="text-white">Apellido:</strong>{" "}
                  {usuario?.persona?.apellido}
                </li>
                <li className="list-group-item bg-transparent text-light border-secondary">
                  <strong className="text-white">DNI:</strong>{" "}
                  {usuario?.persona?.dni}
                </li>
                <li className="list-group-item bg-transparent text-light border-bottom-0">
                  <strong className="text-white">Fecha de Nacimiento: </strong>
                  {usuario?.persona?.fechaNac
                    ? formatDateForInput(persona.fechaNac)
                    : ""}
                </li>
              </ul>
              <button
                onClick={handleShowPersonaModal}
                className="btn btn-outline-primary w-100 mt-auto rounded-pill fw-bold">
                <i className="bi bi-pencil-square me-2"></i> Editar Persona
              </button>
            </div>
          </FormCard>
        </div>

        {/* CARD 2: DATOS DEL USUARIO */}
        <div className="col-12 col-md-5">
          <FormCard
            title="Datos del Usuario"
            styleCard={cardStyles}
            styleHeader={headerStyles}
            styleBody={bodyStyles}>
            <div className="d-flex flex-column justify-content-between h-100 p-2">
              <ul
                className="list-group list-group-flush mb-4 rounded"
                style={{ overflow: "hidden" }}>
                <li
                  className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between align-items-center"
                  onClick={handleShowGmailModal}
                  style={{ cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  title="Haz clic para cambiar tu Gmail">
                  <div>
                    <strong className="text-white">Gmail:</strong>{" "}
                    {usuario?.gmail}
                  </div>
                  <i
                    className="bi bi-pencil fs-6 text-primary"
                    style={{ opacity: 0.7 }}></i>
                </li>
                <li className="list-group-item bg-transparent text-light border-bottom-0">
                  <strong className="text-white">Rol:</strong>{" "}
                  <span className="badge bg-primary bg-opacity-25 text-primary border border-primary">
                    {usuario?.rol?.nombre}
                  </span>
                </li>
              </ul>
              <Button
                variant="outline-primary"
                onClick={handleChangePassword}
                className="btn btn-outline-primary w-100 mt-auto rounded-pill fw-bold">
                <i className="bi bi-lock me-2"></i> Cambiar Contraseña
              </Button>
            </div>
          </FormCard>
        </div>
      </div>

      {/* ================================================== */}
      {/* MODAL DE EDICIÓN DE PERSONA CON DISEÑO DARK MODE   */}
      {/* ================================================== */}
      <Modal
        show={showPersonaModal}
        onHide={handleClosePersonaModal}
        centered
        backdrop="static">
        <Modal.Header
          closeButton
          closeVariant="white"
          className="bg-dark text-white border-bottom border-secondary"
          style={{
            borderTopLeftRadius: "var(--bs-modal-border-radius)",
            borderTopRightRadius: "var(--bs-modal-border-radius)",
          }}>
          <Modal.Title className="fs-5">
            <i className="bi bi-pencil-square text-primary me-2"></i> Actualizar
            Datos Personales
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="bg-dark text-white">
          <div className="row g-3">
            {/* Nombre */}
            <div className="col-md-6">
              <label
                className="form-label fw-bold text-light mb-1"
                style={{ opacity: 0.8 }}>
                Nombre
              </label>
              <input
                type="text"
                className="form-control bg-dark text-white border-secondary"
                name="nombre"
                placeholder="Ej: Juan"
                value={persona.nombre}
                onChange={handlePersonaChange}
              />
            </div>

            {/* Apellido */}
            <div className="col-md-6">
              <label
                className="form-label fw-bold text-light mb-1"
                style={{ opacity: 0.8 }}>
                Apellido
              </label>
              <input
                type="text"
                className="form-control bg-dark text-white border-secondary"
                name="apellido"
                placeholder="Ej: Pérez"
                value={persona.apellido}
                onChange={handlePersonaChange}
              />
            </div>

            {/* DNI */}
            <div className="col-md-6">
              <label
                className="form-label fw-bold text-light mb-1"
                style={{ opacity: 0.8 }}>
                DNI
              </label>
              <input
                type="number"
                className="form-control bg-dark text-white border-secondary"
                name="dni"
                placeholder="Sin puntos ni espacios"
                value={persona.dni || ""}
                onChange={handlePersonaChange}
              />
            </div>

            {/* Fecha de Nacimiento */}
            <div className="col-md-6">
              <label
                className="form-label fw-bold text-light mb-1"
                style={{ opacity: 0.8 }}>
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                className="form-control bg-dark text-white border-secondary"
                style={{ colorScheme: "dark" }} // Mágia para que el calendario nativo se vea oscuro
                name="fechaNac"
                value={
                  typeof (persona.fechaNac as any) === "string"
                    ? (persona.fechaNac as any).split("T")[0]
                    : (persona.fechaNac as any).toISOString().split("T")[0]
                }
                onChange={handlePersonaChange}
              />
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="bg-dark border-top border-secondary">
          <Button
            variant="outline-secondary"
            className="fw-bold rounded-pill text-light"
            onClick={handleClosePersonaModal}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            className="fw-bold rounded-pill px-4"
            onClick={handleGuardarPersona}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ================================================== */}
      {/* MODAL DE EDICIÓN DE GMAIL CON DISEÑO DARK MODE     */}
      {/* ================================================== */}
      <Modal
        show={showGmailModal}
        onHide={handleCloseGmailModal}
        centered
        backdrop="static">
        <Modal.Header
          closeButton
          closeVariant="white"
          className="bg-dark text-white border-bottom border-secondary"
          style={{
            borderTopLeftRadius: "var(--bs-modal-border-radius)",
            borderTopRightRadius: "var(--bs-modal-border-radius)",
          }}>
          <Modal.Title className="fs-5">
            <i className="bi bi-envelope text-primary me-2"></i> Actualizar
            Gmail
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="bg-dark text-white">
          <label
            className="form-label fw-bold text-light mb-1"
            style={{ opacity: 0.8 }}>
            Nuevo Correo Electrónico
          </label>
          <input
            type="email"
            className={`form-control bg-dark text-white border-secondary ${gmailError ? "is-invalid border-danger" : ""}`}
            name="gmail"
            placeholder="Ej: correo@gmail.com"
            value={newEmail || ""}
            onChange={handleGmailChange}
          />
          {gmailError && <div className="invalid-feedback">{gmailError}</div>}
        </Modal.Body>

        <Modal.Footer className="bg-dark border-top border-secondary">
          <Button
            variant="outline-secondary"
            className="fw-bold rounded-pill text-light"
            onClick={handleCloseGmailModal}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            className="fw-bold rounded-pill px-4"
            onClick={handleSubmitEmail}
            disabled={!validEmail}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
