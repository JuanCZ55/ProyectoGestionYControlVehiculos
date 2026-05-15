import TableContainer from "../../src/Components/Table/TableContainer";
import TableResponsive from "../../src/Components/Table/TableResponsive";
import { type PaginaResponseType } from "../../types/PaginaResponse.Type";
import { useEffect, useState, useCallback } from "react";
import NavButtonPosition from "../../src/Components/NavButtonPosition";
import ModalTable from "../../src/Components/Table/ModalTable";
import "../../src/Components/css/BotonModal.css";
import { PaginatorForTable } from "../../src/Components/Table/Paginator";
import endpointsAPI from "../../src/Components/Routes/Enrouters";
import {
  ListadoServiceApiParser,
  PagedResponseSchema,
  type ListadoServiceType,
} from "../../types/ListadoServices.schema";
import ComboBoxBrowser from "../../src/Components/FormBuscador/ComboBoxBrowser";
import { ParserDatesToStringDateOnly } from "../../src/Utils/ParserDatesToStringMessage";
import FormCard from "../../src/Components/Form/FormCard";
import GeneralContainer from "../../src/Components/FormBuscador/GeneralContainer";
import { Button } from "react-bootstrap";
import ResultInfo from "../../src/Components/FormBuscador/ResultInfo";
import Swal from "sweetalert2";
import "../../src/Components/css/FocosTabla.css";
import "../../src/Components/css/scrollbar.css";

export default function ListarServicios() {
  const [idBuscar, setIdBuscar] = useState<string>("");
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [metadataPage, setMetadataPage] = useState<
    PaginaResponseType<ListadoServiceType>
  >({
    data: [],
    totalPaginasCalculadas: 0,
    paginaActual: 1,
    tamanoPaginas: 4,
  });

  const headers = ["Fecha", "Proveedor", "Estado", ""];
  const colWidths = ["15%", "", "", "5%"];

  const fetchData = useCallback(() => {
    if (!idBuscar) {
      setMetadataPage({
        data: [],
        totalPaginasCalculadas: 0,
        paginaActual: 1,
        tamanoPaginas: 4,
      });
      return;
    }
    fetch(
      `${endpointsAPI.mantenimiento.listarPorVehiculoId.action(
        parseInt(idBuscar),
      )}?nroPagina=${currentPage}&tamanoPagina=4`,
      { method: endpointsAPI.mantenimiento.listarPorVehiculoId.method },
    )
      .then((response) => response.json())
      .then((apiResponse) => {
        const chklstParser = PagedResponseSchema.parse(apiResponse);
        const chcklst: ListadoServiceType[] = chklstParser.items.map((item) =>
          ListadoServiceApiParser.parse(item),
        );
        setMetadataPage({
          data: chcklst,
          totalPaginasCalculadas: chklstParser.totalPaginasCalculadas,
          paginaActual: chklstParser.paginaActual,
          tamanoPaginas: chklstParser.tamanoPaginas,
        });
      })
      .catch((error) => console.error(error));
  }, [idBuscar, currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusToggle = async (id: number, currentStatus: boolean) => {
    const endpoint = currentStatus
      ? endpointsAPI.mantenimiento.marcarNoRealizado
      : endpointsAPI.mantenimiento.marcarComoRealizado;

    try {
      const response = await fetch(endpoint.action(id), {
        method: endpoint.method,
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Estado actualizado",
          showConfirmButton: false,
          timer: 1000,
        });
        fetchData();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo procesar la solicitud",
      });
    }
  };

  const dataOrdenada = [...metadataPage.data].sort((a, b) => {
    if (!a.Fecha) return 1;
    if (!b.Fecha) return -1;
    return new Date(b.Fecha).getTime() - new Date(a.Fecha).getTime();
  });

  const tableData = dataOrdenada.map((serv: ListadoServiceType) => (
    <tr key={serv.IdService} style={{ textAlign: "center" }}>
      <td>
        {serv.Fecha ? ParserDatesToStringDateOnly(new Date(serv.Fecha)) : ""}
      </td>
      <td>{serv.Proveedor}</td>
      <td>
        <div className="d-flex justify-content-center align-items-center">
          <Button
            className="boton-modal border-0 p-1 w-50 rounded-1"
            onClick={() => setShowModal(true)}>
            Ver
          </Button>
          <Button
            className={`btn border-0 p-1 w-25 rounded-1 ${
              serv.Realizado ? "btn-success" : "btn-danger"
            }`}
            style={{ marginLeft: "30px" }}
            onClick={() => handleStatusToggle(serv.IdService, serv.Realizado)}>
            {serv.Realizado ? "Realizado" : "No realizado"}
          </Button>
        </div>
      </td>
      <td>
        {serv.Excepcional && (
          <i
            className="bi bi-star-fill text-warning "
            style={{ fontSize: "1.5rem" }}
            title="Servicio Excepcional"></i>
        )}
      </td>
    </tr>
  ));

  return (
    <>
      <GeneralContainer title="Listado de Service por Vehículo">
        <FormCard
          title="Buscar Vehículo por Patente"
          classNameCard="bg-dark text-white m-2 rounded-5"
          classNameHeader="fs-4 text-white text-center border-0 rounded-5"
          classNameBody="fs-5 text-center"
          styleCard={{ maxWidth: "90%", maxHeight: "90%", padding: "9px" }}>
          <ComboBoxBrowser
            apiUrl={endpointsAPI.vehiculos.buscarPorPatenteLike.action("")}
            apiMethod={endpointsAPI.vehiculos.buscarPorPatenteLike.method}
            onEntitySelect={(vehiculo) => {
              setIdBuscar(vehiculo ? vehiculo.idVehiculo : "");
              setVehiculoSeleccionado(vehiculo);
              setCurrentPage(1);
            }}
            placeholder="Busqueda por Patente"
          />
        </FormCard>

        {vehiculoSeleccionado && (
          <>
            <ResultInfo
              title="Vehiculo Seleccionado:"
              info={[
                { label: "Marca", value: vehiculoSeleccionado.marca },
                { label: "Modelo", value: vehiculoSeleccionado.modelo },
                { label: "Año", value: vehiculoSeleccionado.anio },
                { label: "Patente", value: vehiculoSeleccionado.patente },
              ]}
            />
            <TableContainer>
              {metadataPage.data.length > 0 ? (
                <TableResponsive
                  tableData={tableData}
                  headerTitle={headers}
                  colWidths={colWidths}
                  scrollBar={true}
                />
              ) : (
                <div className="text-center py-4 text-danger">
                  No hay Services para el vehículo seleccionado.
                </div>
              )}
            </TableContainer>
          </>
        )}

        <ModalTable
          onClose={() => setShowModal(false)}
          show={showModal}
          title="Datos del Servicio">
          <textarea
            className="form-control"
            rows={10}
            cols={100}
            readOnly
            value={""}></textarea>
        </ModalTable>
        <NavButtonPosition />
      </GeneralContainer>
      {metadataPage.data.length > 0 && vehiculoSeleccionado && (
        <div style={{ marginTop: "-48px" }}>
          <PaginatorForTable
            totalCountPages={metadataPage.totalPaginasCalculadas}
            currentPage={metadataPage.paginaActual}
            previousPage={() => {
              if (currentPage > 1) setCurrentPage(currentPage - 1);
            }}
            nextPage={() => {
              if (currentPage < metadataPage.totalPaginasCalculadas)
                setCurrentPage(currentPage + 1);
            }}
            onPageChange={(newPage) => setCurrentPage(newPage)}
          />
        </div>
      )}
    </>
  );
}
