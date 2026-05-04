import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Container } from "react-bootstrap";
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
    <Navbar
      bg="dark"
      variant="dark"
      expand="lg"
      className="px-3 border-bottom border-secondary shadow-sm">
      <Container fluid>
        <Navbar.Brand
          as={Link}
          to={endpointFront.home.action}
          className="fw-bold d-flex align-items-center">
          <i className="bi bi-shield-check text-primary me-2 fs-4"></i>
          <span className="text-white tracking-wide">Eco Group S.R.L.</span>
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="top-navbar-nav"
          className="border-0 shadow-none"
        />

        <Navbar.Collapse id="top-navbar-nav">
          <Nav className="me-auto"></Nav>
          <Nav className="gap-2">
            {" "}
            <Nav.Link
              as={Link}
              to="/"
              className="d-flex align-items-center rounded px-3 transition-colors hover-bg-light">
              <i className="bi bi-house-door me-2 text-primary"></i> Inicio
            </Nav.Link>
            <Nav.Link
              as={Link}
              to={endpointFront.usuarios.dashboard.action}
              className="d-flex align-items-center rounded px-3">
              <i className="bi bi-person me-2 text-primary"></i> Perfil
            </Nav.Link>
            <Nav.Link
              onClick={handleLogout}
              className="d-flex align-items-center rounded px-3 text-danger"
              style={{ cursor: "pointer" }}>
              <i className="bi bi-box-arrow-right me-2"></i> Salir
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
