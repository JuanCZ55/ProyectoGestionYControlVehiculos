export default function Home() {
  return (
    <div className="container-fluid py-5 px-4">
      <div className="row mb-5 align-items-center bg-dark text-white rounded-4 shadow p-4 p-md-5 border-start border-primary border-5">
        <div className="col-lg-8">
          <h1 className="display-5 fw-bold text-white mb-3">
            Bienvenido a Eco Group S.R.L.
          </h1>
          <p className="lead text-light mb-4" style={{ opacity: 0.8 }}>
            Plataforma integral para la gestión y control de la flota vehicular.
            Este sistema centraliza la información, optimiza los tiempos de
            mantenimiento y mantiene la trazabilidad exacta de cada unidad y sus
            componentes.
          </p>
          <hr className="my-4 border-secondary" />
          <p className="mb-0" style={{ color: "#adb5bd" }}>
            <i className="bi bi-arrow-left-circle me-2 text-primary"></i>
            Selecciona una opción en el menú lateral para comenzar a explorar
            los diferentes módulos.
          </p>
        </div>
        <div className="col-lg-4 text-center d-none d-lg-block">
          <i
            className="bi bi-shield-check text-primary"
            style={{ fontSize: "10rem", opacity: 0.1 }}></i>
        </div>
      </div>

      <h4 className="fw-bold mb-4 px-2" style={{ color: "#e9ecef" }}>
        Características del Sistema
      </h4>
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card h-100 bg-dark text-white border-0 shadow rounded-4">
            <div className="card-body p-4">
              <div
                className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: "60px", height: "60px" }}>
                <i className="bi bi-truck fs-3"></i>
              </div>
              <h5 className="fw-bold text-white">Gestión de Vehículos</h5>
              <p className="text-light" style={{ opacity: 0.7 }}>
                Administra el padrón completo de la flota. Controla el alta y
                baja de las unidades, la asignación de conductores y la
                documentación técnica de cada transporte.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 bg-dark text-white border-0 shadow rounded-4">
            <div className="card-body p-4">
              <div
                className="bg-warning bg-opacity-10 text-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: "60px", height: "60px" }}>
                <i className="bi bi-tools fs-3"></i>
              </div>
              <h5 className="fw-bold text-white">Control de Mantenimiento</h5>
              <p className="text-light" style={{ opacity: 0.7 }}>
                Lleva un registro histórico inmutable de las reparaciones,
                realiza seguimiento del kilometraje y gestiona los
                mantenimientos preventivos y correctivos.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 bg-dark text-white border-0 shadow rounded-4">
            <div className="card-body p-4">
              <div
                className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: "60px", height: "60px" }}>
                <i className="bi bi-clipboard-data fs-3"></i>
              </div>
              <h5 className="fw-bold text-white">Auditoría y Trazabilidad</h5>
              <p className="text-light" style={{ opacity: 0.7 }}>
                Sistema de seguridad y monitoreo. Verifica fechas de vencimiento
                de matafuegos, rotación de neumáticos y audita las acciones de
                los usuarios en la plataforma.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
