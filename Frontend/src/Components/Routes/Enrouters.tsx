export const API_ROUTE = "https://localhost:7283/api";

export const endpointsAPI = {
  vehiculos: {
    nuevo: { action: `${API_ROUTE}/Vehiculos`, method: "POST" },
    listar: { action: `${API_ROUTE}/Vehiculos`, method: "GET" },
    editar: {
      action: (id: number) => `${API_ROUTE}/Vehiculos/${id}`,
      method: "PUT",
    },
    bajaLogica: {
      action: (id: number) => `${API_ROUTE}/Vehiculos/baja/${id}`,
      method: "PATCH",
    },
    altaLogica: {
      action: (id: number) => `${API_ROUTE}/Vehiculos/alta/${id}`,
      method: "PATCH",
    },
    eliminar: {
      action: (id: number) => `${API_ROUTE}/Vehiculos/${id}`,
      method: "DELETE",
    },
    buscarPorId: {
      action: (id: number) => `${API_ROUTE}/Vehiculos/${id}`,
      method: "GET",
    },
    buscarPorPatente: {
      action: (patente: string) =>
        `${API_ROUTE}/Vehiculos/buscarPorPatente/${patente}`,
      method: "GET",
    },
    buscarPorPatenteLike: {
      action: (patente: string) =>
        `${API_ROUTE}/Vehiculos/buscarPorPatenteLike/${patente}`,
      method: "GET",
    },
    asignarAVehiculo: {
      action: (idVehiculo: number, idMatafuego: number) =>
        `${API_ROUTE}/vehiculos/asignarMatafuego/${idVehiculo}/${idMatafuego}`,
      method: "PUT",
    },
  },
  controlKilometraje: {
    nuevo: { action: `${API_ROUTE}/registro-kilometraje`, method: "POST" },
    buscarUltimoRegistroPorVehiculoId: {
      action: (vehiculoId: number) =>
        `${API_ROUTE}/registro-kilometraje/latest/${vehiculoId}`,
      method: "GET",
    },
    listar: {
      action: (patente: string) =>
        `${API_ROUTE}/registro-kilometraje/listado/${patente}`,
      method: "GET",
    },
    editar: {
      action: (id: number) => `${API_ROUTE}/registro-kilometraje/${id}`,
      method: "PUT",
    },
    buscarPorId: {
      action: (id: number) => `${API_ROUTE}/registro-kilometraje/${id}`,
      method: "GET",
    },
    bajaLogica: {
      action: (id: number) => `${API_ROUTE}/registro-kilometraje/baja/${id}`,
      method: "PATCH",
    },
    altaLogica: {
      action: (id: number) => `${API_ROUTE}/registro-kilometraje/alta/${id}`,
      method: "PATCH",
    },
  },
  documentos: {
    nuevo: { action: `${API_ROUTE}/Documentos`, method: "POST" },
    listar: { action: `${API_ROUTE}/Documentos`, method: "GET" },
    editar: {
      action: (id: number) => `${API_ROUTE}/Documentos/${id}`,
      method: "PUT",
    },
    eliminar: {
      action: (id: number) => `${API_ROUTE}/documentos/${id}`,
      method: "DELETE",
    },
    buscarPorId: {
      action: (id: number) => `${API_ROUTE}/Documentos/${id}`,
      method: "GET",
    },
    buscarPorVehiculoId: {
      action: (vehiculoId: number) =>
        `${API_ROUTE}/Documentos/vehiculo/${vehiculoId}`,
      method: "GET",
    },
    buscarPorMatafuegoId: {
      action: (matafuegoId: number) =>
        `${API_ROUTE}/documentos/matafuego/${matafuegoId}`,
      method: "GET",
    },
    cargarDocumento: {
      action: (documentoId: number) =>
        `${API_ROUTE}/Documentos/archivo/${documentoId}`,
      method: "GET",
    },
    bajaLogica: {
      action: (documentoId: number) =>
        `${API_ROUTE}/Documentos/baja/${documentoId}`,
      method: "PATCH",
    },
  },
  checklist: {
    nuevo: { action: `${API_ROUTE}/Checklist`, method: "POST" },
    listar: { action: `${API_ROUTE}/Checklist`, method: "GET" },
    editar: {
      action: (id: number) => `${API_ROUTE}/Checklist/${id}`,
      method: "PUT",
    },
    eliminar: {
      action: (id: number) => `${API_ROUTE}/Checklist/${id}`,
      method: "DELETE",
    },
    buscarPorId: {
      action: (id: number) => `${API_ROUTE}/Checklist/${id}`,
      method: "GET",
    },

    bajaLogica: {
      action: (id: number) => `${API_ROUTE}/Checklist/baja/${id}`,
      method: "PATCH",
    },
    altaLogica: {
      action: (id: number) => `${API_ROUTE}/Checklist/alta/${id}`,
      method: "PATCH",
    },
    listarPorVehiculoId: {
      action: (vehiculoId: number) =>
        `${API_ROUTE}/Checklist/vehiculo/${vehiculoId}`,
      method: "GET",
    },
  },
  matafuegos: {
    listar: {
      action: (nroPagina: number, tamanoPagina: number): string =>
        `${API_ROUTE}/matafuegos?numeroPagina=${nroPagina}&tamanoPagina=${tamanoPagina}`,
      method: "GET",
    },
    nuevo: {
      action: `${API_ROUTE}/matafuegos`,
      method: "POST",
    },
    editar: {
      action: (id: number) => `${API_ROUTE}/matafuegos/${id}`,
      method: "PUT",
    },
    eliminar: {
      action: (id: number) => `${API_ROUTE}/matafuegos/${id}`,
      method: "DELETE",
    },
    buscarPorId: {
      action: (id: number) => `${API_ROUTE}/matafuegos/${id}`,
      method: "GET",
    },
    bajaLogica: {
      action: (id: number) => `${API_ROUTE}/matafuegos/baja/${id}`,
      method: "PATCH",
    },
    altaLogica: {
      action: (id: number) => `${API_ROUTE}/matafuegos/alta/${id}`,
      method: "PATCH",
    },

    buscarPorNroSerie: {
      action: (nroSerie: string) => {
        return `${API_ROUTE}/matafuegos/buscarPorNroSerie/${nroSerie}`;
      },
      method: "GET",
    },
  },
  mantenimiento: {
    nuevo: { action: `${API_ROUTE}/Mantenimiento`, method: "POST" },
    listarPorVehiculoId: {
      action: (vehiculoId: number) =>
        `${API_ROUTE}/Mantenimiento/vehiculo/${vehiculoId}`,
      method: "GET",
    },
    marcarComoRealizado: {
      action: (id: number) =>
        `${API_ROUTE}/Mantenimiento/servicio/resuelto/${id}`,
      method: "PATCH",
    },
    marcarNoRealizado: {
      action: (id: number) =>
        `${API_ROUTE}/Mantenimiento/servicio/no/resuelto/${id}`,
      method: "PATCH",
    },
  },
  posicionNeumatico: {
    Listar: {
      action: `${API_ROUTE}/posiciones-neumaticos`,
      method: "GET",
    },
    Agregar: {
      action: `${API_ROUTE}/posiciones-neumaticos`,
      method: "POST",
    },
    ObtenerPorId: {
      action: (id: number) => `${API_ROUTE}/posiciones-neumaticos/${id}`,
      method: "GET",
    },
    Actualizar: {
      action: (id: number) => `${API_ROUTE}/posiciones-neumaticos/${id}`,
      method: "PUT",
    },
    Eliminar: {
      action: (id: number) => `${API_ROUTE}/posiciones-neumaticos/${id}`,
      method: "DELETE",
    },
  },
  neumaticos: {
    listar: {
      action: (nroPagina: number, tamanoPagina: number): string =>
        `${API_ROUTE}/neumaticos?numeroPagina=${nroPagina}&tamanoPagina=${tamanoPagina}`,
      method: "GET",
    },
    nuevo: {
      action: `${API_ROUTE}/neumaticos`,
      method: "POST",
    },
    editar: {
      action: (id: number) => `${API_ROUTE}/neumaticos/${id}`,
      method: "PUT",
    },
    eliminar: {
      action: (id: number) => `${API_ROUTE}/neumaticos/${id}`,
      method: "DELETE",
    },
    buscarPorId: {
      action: (id: number) => `${API_ROUTE}/neumaticos/${id}`,
      method: "GET",
    },
    bajaLogica: {
      action: (id: number) => `${API_ROUTE}/neumaticos/baja/${id}`,
      method: "PATCH",
    },
    altaLogica: {
      action: (id: number) => `${API_ROUTE}/neumaticos/alta/${id}`,
      method: "PATCH",
    },
    asignarNeumaticos: {
      action: (idVehiculo: number, idNeumatico: number) =>
        `${API_ROUTE}/neumaticos/asignar/neumatico/${idVehiculo}/a/${idNeumatico}`,
      method: "PUT",
    },
    borrarAsignacion: {
      action: (idNeumatico: number) =>
        `${API_ROUTE}/neumaticos/borrar/asignacion/${idNeumatico}`,
      method: "PUT",
    },
    obtenerTodosLosNeumaticosAsignadosAVehiculo: {
      action: (
        idVehiculo: number,
        numeroPagina: number,
        tamanoPagina: number,
      ) =>
        `${API_ROUTE}/neumaticos/getAllAssignedTo?idVehiculo=${idVehiculo}&numeroPagina=${numeroPagina}&tamanoPagina=${tamanoPagina}`,
      method: "GET",
    },
    obtenerTodosLosNeumaticosNoAsignados: {
      action: (numeroPagina: number, tamanoPagina: number) =>
        `${API_ROUTE}/neumaticos/getAllNotAssigned?numeroPagina=${numeroPagina}&tamanoPagina=${tamanoPagina}`,
      method: "GET",
    },
  },
  login: {
    action: `${API_ROUTE}/ControllerAuth/login`,
  },
  usuarios: {
    nuevo: { action: `${API_ROUTE}/ControllerAuth/register`, method: "POST" },
    listar: {
      action: (nroPagina: number, tamanoPagina: number): string =>
        `${API_ROUTE}/Usuarios?numeroPagina=${nroPagina}&tamanoPagina=${tamanoPagina}`,
      method: "GET",
    },
    baja: {
      action: (id: number) => `${API_ROUTE}/Usuarios/baja/${id}`,
      method: "PATCH",
    },
    alta: {
      action: (id: number) => `${API_ROUTE}/Usuarios/alta/${id}`,
      method: "PATCH",
    },
    cambiarRol: {
      action: (id: number) => `${API_ROUTE}/usuarios/rol/${id}`,
      method: "PUT",
    },
    resetPassword: {
      action: (id: number) => `${API_ROUTE}/usuarios/reset/${id}`,
      method: "PUT",
    },
    actualizarAvatar: {
      action: (id: number) => `${API_ROUTE}/usuarios/avatar/${id}`,
      method: "POST",
    },
    getAvatar: {
      action: (id: number) => `${API_ROUTE}/usuarios/avatar/${id}`,
      method: "GET",
    },
    getUsuario: {
      action: (id: number) => `${API_ROUTE}/usuarios/${id}`,
      method: "GET",
    },
    actualizarPersona: {
      action: (id: number) => `${API_ROUTE}/personas/${id}`,
      method: "PUT",
    },
    cambiarPassword: {
      action: (id: number) => `${API_ROUTE}/usuarios/cambiarContrasena/${id}`,
      method: "PUT",
    },
    cambiarEmail: {
      action: (id: number) => `${API_ROUTE}/usuarios/email/${id}`,
      method: "PUT",
    },
  },
  persona: {
    actualizarPersona: {
      action: (id: number) => `${API_ROUTE}/personas/${id}`,
      method: "PUT",
    },
  },
  auditorias: {
    listar: {
      action: (nroPagina: number, tamanoPagina: number): string =>
        `${API_ROUTE}/auditorias?numeroPagina=${nroPagina}&tamanoPagina=${tamanoPagina}`,
      method: "GET",
    },
  },
};
//ENDPOINTS DEL FRONTEND
export const endpointFront = {
  home: {
    action: "/",
  },
  vehiculos: {
    listar: { action: "/Vehiculos/Listar" },
    nuevo: { action: "/Vehiculos/Nuevo" },
    actualizar: {
      action: (id: number) => {
        return "/Vehiculos/Actualizar/" + id;
      },
      endpoint: "/Vehiculos/Actualizar/:id",
    },
    gestion: { action: "/VehiculosGestion" },
    documentos: { action: "/Vehiculos/Documentacion" },
  },
  mantenimiento: {
    listar: { action: "/Mantenimiento/Listar" },
    nuevo: { action: "/Mantenimiento/Nuevo" },
    gestion: { action: "/Mantenimiento" },
    nuevoEx: { action: "/Mantenimiento/NuevoExcepcional" },
    listarPorVehiculo: { action: "/Mantenimiento/ListarServicios" },
  },
  controlKilometraje: {
    listar: { action: "/KilometrosListar" },
    gestion: { action: "/ControlKilometraje" },
    nuevo: { action: "/RegistroKilometraje/Nuevo" },
    actualizar: {
      action: (id: number) => {
        return "/RegistroKilometraje/Actualizar/" + id;
      },
      endpoint: "/RegistroKilometraje/Actualizar/:id",
    },
  },
  matafuegos: {
    gestion: { action: "/Matafuegos" },
    agregar: { action: "/Matafuegos/Nuevo" },
    editar: {
      action: (id: number) => {
        return "/Matafuegos/Editar/" + id;
      },
      endpoint: "/Matafuegos/Editar/:id",
    },
    listar: {
      action: "/Matafuegos/Listar",
    },
    asignarAVehiculo: {
      action: "/Matafuegos/AsignarAVehiculo",
    },
    documentos: {
      action: "/Matafuegos/Documentacion",
    },
  },
  neumaticos: {
    gestion: { action: "/Neumaticos" },
    agregar: { action: "/Neumaticos/Nuevo" },
    asignar: { action: "/Neumaticos/Asignar" },
    listar: { action: "/Neumaticos/Listar" },
    editar: {
      action: (id: number) => `/Neumaticos/Editar/${id}`,
      endpoint: `/Neumaticos/Editar/:id`,
    },
  },
  checklist: {
    gestion: { action: "/Checklist" },
    listar: { action: "/Checklist/Listar" },
  },
  login: {
    action: "/login",
  },
  unauthoraized: {
    action: "/unauthoraized",
  },
  notfound: {
    action: "*",
  },
  logout: {
    action: "/logout",
  },
  usuarios: {
    gestion: { action: `/Usuarios` },
    nuevo: { action: `/Usuarios/Nuevo` },
    listar: { action: `/Usuarios/Listar` },
    //actualizar: { action: `/Usuarios/Actualizar` },
    dashboard: { action: `/Usuarios/Dashboard` },
  },
  logs: {
    listar: { action: `/Logs/Listar` },
  },
};
export default endpointsAPI;
