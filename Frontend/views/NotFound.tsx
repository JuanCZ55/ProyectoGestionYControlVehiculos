import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}>
      <Row className="text-center shadow p-5 bg-white rounded">
        <Col>
          <i
            className="bi bi-exclamation-circle-fill text-danger"
            style={{ fontSize: "6rem" }}></i>

          <h1 className="mt-3 text-danger fw-bold">404</h1>
          <h2 className="mb-3">Página No Encontrada</h2>

          <p className="lead text-muted">
            Esta página no existe <br />
            Lo sentimos, la página que estás buscando no se pudo encontrar en
            ArgenCore.
          </p>

          <Button
            variant="primary"
            size="lg"
            className="mt-4 px-5"
            onClick={() => navigate("/")}>
            <i className="bi bi-arrow-left-circle me-2"></i>
            Volver al Inicio
          </Button>
        </Col>
      </Row>
    </Container>
  );
}
