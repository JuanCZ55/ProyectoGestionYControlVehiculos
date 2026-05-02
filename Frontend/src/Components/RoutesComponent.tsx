import { Col, Container, Row } from "react-bootstrap";
import { Routes, Route, Outlet } from "react-router-dom";
import VehiculosGestion from "../../views/Vehiculo/VehiculosGestion";
import VehiculosKilometros from "../../views/VehiculosKilometros";
import { AgregarRegistroKilometraje } from "../../views/RegistrosKilometraje/AgregarRegistroKilometraje";
import ActualizarRegistroKilometraje from "../../views/RegistrosKilometraje/ActualizarRegistroKilometraje";
import VehiculosMantenimiento from "../../views/VehiculosMantenimieto";
import VehiculosListar from "../../views/Vehiculo/VehiculosListar";
import VehiculosAgregar from "../../views/Vehiculo/VehiculosAgregar";
import Matafuegos from "../../views/Matafuegos";
import Neumaticos from "../../views/Neumaticos";
import KilometrosListar from "../../views/RegistrosKilometraje/KilometrosListar";
import VehiculosAcualizar from "../../views/Vehiculo/VehiculosActualizar";
import VehiculosDocumentos from "../../views/VehiculosDocumentos";
import Checklist from "../../views/Checklist/Checklist";
import { endpointFront } from "./Routes/Enrouters";
import { AgregarMatafuego } from "../../views/Matafuegos/AgregarMatafuego";
import { ListarMatafuegos } from "../../views/Matafuegos/ListarMatafuegos";
import MatafuegoDocumentos from "../../views/Documentos/MatafuegoDocumentos";
import ChecklistListar from "../../views/Checklist/ChecklistListar";
import { EditarMatafuego } from "../../views/Matafuegos/EditarMatafuego";
import { AsignarMatafuegoAVehiculo } from "../../views/Matafuegos/AsignarMatafuegoAVehiculo";
import NuevoServicio from "../../views/Servicios/NuevoServicio";
import NuevoExcepcional from "../../views/Servicios/NuevoExcepcional";
import ListarServicios from "../../views/Servicios/ListarServicios";
import { AgregarNeumatico } from "../../views/Neumaticos/AgregarNeumatico";
import { ListarNeumaticos } from "../../views/Neumaticos/ListarNeumaticos";
import { EditarNeumaticos } from "../../views/Neumaticos/EditarNeumaticos";
import { AsignarNeumaticos } from "../../views/Neumaticos/AsignarNeumaticos";
import Unauthorized from "../../views/Unauthorized";
import SideNavBar from "./SideNavBar";
import TopNavBar from "./TopNavBar";
import { ProtectedRoute } from "./ProtectedRoute";
import Login from "../../views/Auth/Login";
import Usuarios from "../../views/Usuarios";
import { AgregarUsuario } from "../../views/Users/RegisterUsers";
import UsersList from "../../views/Users/UsersList";
import { UserDashboard } from "../../views/Users/UserDashboard";
import ListaLogs from "../../views/Logs/ListaLogs";
const ProtectedLayout = () => {
  return (
    <>
      <TopNavBar />
      <Container fluid>
        <Row>
          <SideNavBar />
          <Col
            xs={12}
            md={9}
            lg={10}
            className="p-4 bg-secondary"
            style={{ minHeight: "100vh" }}>
            <Outlet />
          </Col>
        </Row>
      </Container>
    </>
  );
};
export default function RoutesComponent() {
  return (
    <Routes>
      <Route path={endpointFront.login.action} element={<Login />} />
      <Route
        path={endpointFront.unauthoraized.action}
        element={<Unauthorized />}
      />
      <Route element={ProtectedRoute({ allowedRoles: ["1", "2"] })}>
        <Route element={ProtectedLayout()}>
          <Route
            path="/"
            element={
              <>
                <h1>
                  Bienvenido al sistema de Gestión de vehículos de Eco Group
                  S.R.L.
                </h1>
                <p>App con React y Bootstrap.</p>
              </>
            }
          />
          <Route
            path={endpointFront.vehiculos.gestion.action}
            element={<VehiculosGestion />}
          />
          <Route
            path={endpointFront.controlKilometraje.gestion.action}
            element={<VehiculosKilometros />}
          />
          <Route
            path={endpointFront.controlKilometraje.nuevo.action}
            element={<AgregarRegistroKilometraje />}
          />
          <Route
            path={endpointFront.controlKilometraje.actualizar.endpoint}
            element={<ActualizarRegistroKilometraje />}
          />
          <Route
            path={endpointFront.controlKilometraje.listar.action}
            element={<KilometrosListar />}
          />
          <Route
            path={endpointFront.mantenimiento.gestion.action}
            element={<VehiculosMantenimiento />}
          />
          <Route
            path={endpointFront.vehiculos.listar.action}
            element={<VehiculosListar />}
          />
          <Route
            path={endpointFront.vehiculos.nuevo.action}
            element={<VehiculosAgregar />}
          />
          <Route
            path={endpointFront.vehiculos.actualizar.endpoint}
            element={<VehiculosAcualizar />}
          />
          <Route
            path={endpointFront.matafuegos.gestion.action}
            element={<Matafuegos />}
          />
          <Route
            path={endpointFront.neumaticos.gestion.action}
            element={<Neumaticos />}
          />
          <Route
            path={endpointFront.neumaticos.agregar.action}
            element={<AgregarNeumatico />}></Route>

          <Route
            path={endpointFront.neumaticos.editar.endpoint}
            element={<EditarNeumaticos />}></Route>
          <Route
            path={endpointFront.neumaticos.asignar.action}
            element={<AsignarNeumaticos />}></Route>
          <Route
            path={endpointFront.neumaticos.listar.action}
            element={<ListarNeumaticos />}></Route>

          <Route
            path={endpointFront.vehiculos.documentos.action}
            element={<VehiculosDocumentos />}
          />
          <Route
            path={endpointFront.checklist.gestion.action}
            element={<Checklist />}
          />
          <Route
            path={endpointFront.matafuegos.agregar.action}
            element={<AgregarMatafuego />}
          />
          <Route
            path={endpointFront.matafuegos.listar.action}
            element={<ListarMatafuegos />}
          />
          <Route
            path={endpointFront.matafuegos.editar.endpoint}
            element={<EditarMatafuego />}
          />
          <Route
            path={endpointFront.matafuegos.asignarAVehiculo.action}
            element={<AsignarMatafuegoAVehiculo />}
          />
          <Route
            path={endpointFront.matafuegos.documentos.action}
            element={<MatafuegoDocumentos />}
          />
          <Route
            path={endpointFront.checklist.listar.action}
            element={<ChecklistListar />}
          />
          <Route
            path={endpointFront.mantenimiento.nuevo.action}
            element={<NuevoServicio />}
          />
          <Route
            path={endpointFront.mantenimiento.nuevoEx.action}
            element={<NuevoExcepcional />}
          />
          <Route
            path={endpointFront.mantenimiento.listarPorVehiculo.action}
            element={<ListarServicios />}
          />
          <Route
            path={endpointFront.usuarios.dashboard.action}
            element={<UserDashboard />}></Route>
        </Route>
      </Route>
      <Route element={ProtectedRoute({ allowedRoles: ["1"] })}>
        <Route element={ProtectedLayout()}>
          <Route
            path={endpointFront.usuarios.listar.action}
            element={<UsersList />}
          />
          <Route
            path={endpointFront.usuarios.nuevo.action}
            element={<AgregarUsuario />}
          />
          <Route
            path={endpointFront.usuarios.gestion.action}
            element={<Usuarios />}
          />
          <Route
            path={endpointFront.logs.listar.action}
            element={<ListaLogs />}
          />
        </Route>
      </Route>
    </Routes>
  );
}
