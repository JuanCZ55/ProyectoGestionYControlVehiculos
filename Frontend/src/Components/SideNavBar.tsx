import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Accordion, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { endpointFront } from "../Components/Routes/Enrouters";
import { useAuth } from "../context/AuthContext";

export default function SideNavBar() {
  const { user } = useAuth();

  return (
    <Col
      xs={12}
      md={3}
      lg={2}
      className="p-0 bg-dark border-end border-secondary" /* Borde derecho sutil */
      style={{ minHeight: "100vh" }}>
      <Navbar
        bg="dark"
        variant="dark"
        expand="md"
        className="flex-md-column align-items-start p-3 min-vh-100 mt-2">
        <Navbar.Toggle aria-controls="sidebar-nav" className="mb-3 border-0" />

        <Navbar.Collapse id="sidebar-nav" className="flex-column w-100">
          <Nav className="flex-column w-100 gap-2">
            {" "}
            {/* gap-2 para separar los acordeones */}
            {/* Acordeón Vehículos */}
            <Accordion
              defaultActiveKey="0"
              className="w-100 accordion-dark shadow-sm">
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  <i className="bi bi-truck me-3 fs-5"></i> Vehículos
                </Accordion.Header>
                <Accordion.Body className="p-2 pt-0">
                  <Nav className="flex-column ms-3 ps-2 border-start border-secondary">
                    <Nav.Link
                      as={Link}
                      to="/VehiculosGestion"
                      className="nav-link-custom">
                      <i className="bi bi-list me-2"></i> Gestión
                    </Nav.Link>
                    <Nav.Link
                      as={Link}
                      to="/ControlKilometraje"
                      className="nav-link-custom">
                      <i className="bi bi-speedometer2 me-2"></i> Control
                    </Nav.Link>
                    <Nav.Link
                      as={Link}
                      to="/Mantenimiento"
                      className="nav-link-custom">
                      <i className="bi bi-wrench me-2"></i> Mantenimiento
                    </Nav.Link>
                    <Nav.Link
                      as={Link}
                      to="/Matafuegos"
                      className="nav-link-custom">
                      <i className="bi bi-fire me-2 text-danger"></i> Matafuegos
                    </Nav.Link>
                    <Nav.Link
                      as={Link}
                      to="/Neumaticos"
                      className="nav-link-custom">
                      <i className="bi bi-disc me-2 text-warning"></i>{" "}
                      Neumáticos
                    </Nav.Link>
                  </Nav>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
            {/* Acordeón Servicios (Solo Admin) */}
            {user && user.role == 1 && (
              <Accordion
                defaultActiveKey="1"
                className="w-100 accordion-dark shadow-sm">
                <Accordion.Item eventKey="1">
                  <Accordion.Header>
                    <i className="bi bi-shield-lock me-3 fs-5"></i>{" "}
                    Administración
                  </Accordion.Header>
                  <Accordion.Body className="p-2 pt-0">
                    <Nav className="flex-column ms-3 ps-2 border-start border-secondary">
                      <Nav.Link
                        as={Link}
                        to={endpointFront.usuarios.gestion.action}
                        className="nav-link-custom">
                        <i className="bi bi-people me-2"></i> Usuarios
                      </Nav.Link>
                      <Nav.Link
                        as={Link}
                        to={endpointFront.logs.listar.action}
                        className="nav-link-custom">
                        <i className="bi bi-journal-text me-2"></i> Logs
                      </Nav.Link>
                    </Nav>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </Col>
  );
}
