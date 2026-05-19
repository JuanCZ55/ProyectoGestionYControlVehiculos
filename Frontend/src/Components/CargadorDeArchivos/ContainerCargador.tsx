import { useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import Enrouters from "../../Components/Routes/Enrouters";

interface ContainerCargadorProps {
  show: boolean;
  onHide: () => void;
  idVehiculo?: number;
  idMatafuego?: number;
  tipoDocumento?: string;
  entityLabel?: string;
  onSuccess?: () => void;
  idDocumentoViejo?: number;
}

export default function ContainerCargador({
  show,
  onHide,
  idVehiculo,
  idMatafuego,
  tipoDocumento = "",
  entityLabel = "",
  onSuccess,
  idDocumentoViejo,
}: ContainerCargadorProps) {
  const [fechaEmision, setFechaEmision] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nombreDocumento, setNombreDocumento] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const tipo = tipoDocumento || nombreDocumento;

    if (!tipo || !fechaEmision || !fechaVencimiento || !archivo) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    const formData = new FormData();
    formData.append("Tipo", tipo);
    formData.append("FechaEmision", fechaEmision);
    formData.append("FechaVencimiento", fechaVencimiento);
    formData.append("Archivo", archivo);
    if (idVehiculo) formData.append("IdVehiculo", idVehiculo.toString());
    if (idMatafuego) formData.append("IdMatafuego", idMatafuego.toString());
    if (entityLabel) formData.append("EntityLabel", entityLabel);

    setLoading(true);
    console.log([...formData.entries()]);
    try {
      if (idDocumentoViejo && idDocumentoViejo > 0) {
        const responseFromApiLogicalDelete = await fetch(
          Enrouters.documentos.bajaLogica.action(idDocumentoViejo),
          {
            method: Enrouters.documentos.bajaLogica.method,
          },
        );
        if (!responseFromApiLogicalDelete.ok) {
          const data = await responseFromApiLogicalDelete.json();
          throw new Error(
            data?.message || "Error al eliminar el documento viejo",
          );
        }
      }
      const res = await fetch(Enrouters.documentos.nuevo.action, {
        method: Enrouters.documentos.nuevo.method,
        body: formData,
      });
      if (!res.ok) {
        // const data = await res.json();
        const data = await res.text();
        console.log("Error data:", data);
        throw new Error(data || "Error al cargar el documento");
      }
      setLoading(false);
      if (onSuccess) onSuccess();
      onHide();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Cargar nuevo documento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>Tipo de documento</Form.Label>
            {!tipoDocumento ? (
              <Form.Control
                type="text"
                value={nombreDocumento}
                onChange={(e) => setNombreDocumento(e.target.value)}
                placeholder="Nombre del documento"
                required
              />
            ) : (
              <Form.Control
                type="text"
                value={tipoDocumento}
                disabled
                readOnly
              />
            )}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Fecha de emisión</Form.Label>
            <Form.Control
              type="date"
              value={fechaEmision}
              onChange={(e) => setFechaEmision(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Fecha de vencimiento</Form.Label>
            <Form.Control
              type="date"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Archivo</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) =>
                setArchivo((e.target as HTMLInputElement).files?.[0] || null)
              }
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Cargar"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
