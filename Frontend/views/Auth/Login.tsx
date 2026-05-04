import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import endpointsApi from "../../src/Components/Routes/Enrouters";
import { useAuth } from "../../src/context/AuthContext";

export default function Login() {
  const [gmail, setGmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(endpointsApi.login.action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gmail, contrasena }),
      });

      if (response.ok) {
        const data = await response.json();
        login(data.token);
        navigate("/");
      } else {
        setError("El correo o la contraseña son incorrectos.");
      }
    } catch (err) {
      console.error("Error en el login:", err);
      setError(
        "Error al conectar con el servidor. Verifica que tu API esté encendida.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", backgroundColor: "#1a1d20" }}>
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={8} lg={5} xl={4}>
          <Card
            className="shadow-lg border-0 rounded-4"
            style={{ backgroundColor: "#212529" }}>
            <Card.Body className="p-5 text-white">
              <div className="text-center mb-4">
                <div
                  className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: "80px", height: "80px" }}>
                  <i
                    className="bi bi-shield-lock text-primary"
                    style={{ fontSize: "2.5rem" }}></i>
                </div>
                <h2 className="fw-bold mt-2">ArgenCore</h2>
                <p className="text-light" style={{ opacity: 0.7 }}>
                  Ingresa tus credenciales para continuar
                </p>
              </div>

              {error && (
                <Alert
                  variant="danger"
                  className="text-center bg-danger bg-opacity-10 border-danger text-danger">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label className="fw-semibold text-light">
                    Correo Electrónico
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="ejemplo@ecogroup.com"
                    value={gmail}
                    onChange={(e) => setGmail(e.target.value)}
                    required
                    size="lg"
                    className="bg-dark text-white border-secondary"
                    style={{ colorScheme: "dark" }}
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formBasicPassword">
                  <Form.Label className="fw-semibold text-light">
                    Contraseña
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    required
                    size="lg"
                    className="bg-dark text-white border-secondary" // Inputs oscuros
                    style={{ colorScheme: "dark" }}
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 fw-bold mt-2"
                  size="lg"
                  disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Ingresar"
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
