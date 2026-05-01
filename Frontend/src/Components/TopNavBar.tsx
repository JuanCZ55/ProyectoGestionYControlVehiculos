import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { endpointFront } from "./Routes/Enrouters";
import { useAuth } from "../context/AuthContext";

export default function TopNavBar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(endpointFront.login.action);
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="px-3">
      <Navbar.Brand href={endpointFront.home.action}>
        Eco Group S.R.L.
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="top-navbar-nav" />
      <Navbar.Collapse id="top-navbar-nav">
        <Nav className="me-auto"></Nav>
        <Nav>
          <Nav.Link as={Link} to="/Dashboard">
            <i className="bi bi-clipboard-data me-2"></i> Dashboard
          </Nav.Link>
          <Nav.Link as={Link} to="/">
            <i className="bi bi-house-door me-2"></i> Inicio
          </Nav.Link>
          <Nav.Link as={Link} to={endpointFront.usuarios.dashboard.action}>
            <i className="bi bi-person me-2"></i> Perfil
          </Nav.Link>
          <Nav.Link as={Link} to="/Notifications">
            <i className="bi bi-bell me-2"></i> Notificaciones
          </Nav.Link>
          <Nav.Link onClick={handleLogout} style={{ cursor: "pointer" }}>
            <i className="bi bi-box-arrow-right me-2"></i> Salir
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
