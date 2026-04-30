import TableContainer from "../../src/Components/Table/TableContainer";
import TabFilterRadios from "../../src/Components/Table/TableFilterRadios";
import TableResponsive from "../../src/Components/Table/TableResponsive";

import { useEffect, useState } from "react";
import NavButtonPosition from "../../src/Components/NavButtonPosition";
import ModalTableHandler from "../../src/Components/Functions/ModalTableHandler";
import ModalTable from "../../src/Components/Table/ModalTable";
import { ButtonEdit } from "../../src/Components/Table/ModalTableButtonsAll";
import AltaBajaLogica from "../../src/Components/Table/AltaBajaLogica";
import {
  VehiculoApiParser,
  type VehiculoSchemaType,
} from "../../types/Vehiculo.schema";
import { type PaginaResponseType } from "../../types/PaginaResponse.Type";
import z from "zod";
import { PaginatorForTable } from "../../src/Components/Table/Paginator";
import endpointsAPI, {
  endpointFront,
} from "../../src/Components/Routes/Enrouters";

const headers = [
  "Marca",
  "Modelo",
  "Año",
  "Patente",
  "Numero de Chasis",
  "Numero de Motor",
  "Matafuego",
  "Estado",
];
const colWidths = [
  "90px",
  "100px",
  "50px",
  "65px",
  "200px",
  "150px",
  "70px",
  "70px",
];

export default function VehiculosListar() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedMarca, setSelectedMarca] = useState<string>("");
  const [selectedModelo, setSelectedModelo] = useState<string>("");
  const [selectedPatente, setSelectedPatente] = useState<string>("");
  const [selectedNroSerie, setSelectedNroSerie] = useState<string>("");
  const [selectedProveedor, setSelectedProveedor] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filtroActivo, setFiltroActivo] = useState<string | null>("opcion1");
  const [metadataPage, setMetadataPage] = useState<
    PaginaResponseType<VehiculoSchemaType>
  >({
    data: [],
    totalPaginasCalculadas: 0,
    paginaActual: 1,
    tamanoPaginas: 10,
  });
  const [selectedEstado, setSelectedEstado] =
    useState<boolean>(
      true,
    ); /*ACA HAY Q HACER LA FUNCION DE LOS BOTONES DE ALTA Y BAJA*/
  const handleRowClick = (
    id: string,
    marca?: string,
    modelo?: string,
    patente?: string,
    estadoStr?: string,
    nroSerie?: string,
    proveedor?: string,
  ) => {
    setSelectedId(id);
    setSelectedMarca(marca || "");
    setSelectedModelo(modelo || "");
    setSelectedPatente(patente || "");
    setSelectedEstado(estadoStr === "true");
    setSelectedNroSerie(nroSerie || "");
    setSelectedProveedor(proveedor || "");
    setShowModal(true);
  };
  useEffect(() => {
    let url = `${endpointsAPI.vehiculos.listar.action}?nroPagina=${currentPage}&tamanoPagina=10`;
    if (filtroActivo === "opcion2") {
      url += `&estado=true`;
    } else if (filtroActivo === "opcion3") {
      url += `&estado=false`;
    }

    fetch(url, {
      method: endpointsAPI.vehiculos.listar.method,
    })
      .then((response) => response.json())
      .then((apiResponse) => {
        console.log(apiResponse);

        const vehiculosParser = z.array(VehiculoApiParser);
        const vehiculos: VehiculoSchemaType[] = vehiculosParser.parse(
          apiResponse.items,
        );
        setMetadataPage({
          data: vehiculos,
          ...apiResponse,
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [currentPage, filtroActivo]);

  const tableData = metadataPage.data.map((vehiculo: VehiculoSchemaType) => (
    <tr
      key={vehiculo.idVehiculo}
      onClick={ModalTableHandler(handleRowClick, [
        "marca",
        "modelo",
        "patente",
        "estado",
        "nroSerie",
        "proveedor",
      ])}
      style={{ cursor: "pointer", textAlign: "center" }}
      data-id={vehiculo.idVehiculo}
      data-marca={vehiculo.Marca}
      data-modelo={vehiculo.Modelo}
      data-patente={vehiculo.Patente}
      data-estado={vehiculo.Estado}
      data-nroSerie={vehiculo.Matafuego?.NroSerie}
      data-proveedor={vehiculo.Matafuego?.Proveedor}>
      <td>{vehiculo.Marca}</td>
      <td>{vehiculo.Modelo}</td>
      <td>{vehiculo.Anio}</td>
      <td>{vehiculo.Patente}</td>
      <td>{vehiculo.NumeroChasis}</td>
      <td>{vehiculo.NumeroMotor}</td>
      <td>{vehiculo.Matafuego ? "Sí" : "No"}</td>
      <td>{vehiculo.Estado ? "Activo" : "Inactivo"}</td>
    </tr>
  ));

  return (
    <>
      <div className="my-4 d-flex justify-content-end">
        <TabFilterRadios
          defaultValue="opcion1"
          onChange={(value) => {
            setFiltroActivo(value);
            setCurrentPage(1);
          }}
          options={[
            { value: "opcion1", label: " Ver Todos", icon: "bi-eye" },
            { value: "opcion2", label: " Ver Activos", icon: "bi-power" },
            { value: "opcion3", label: " Ver Inactivos", icon: "bi-x-circle" },
          ]}
        />
      </div>
      <TableContainer title="Listado de Vehículos">
        <TableResponsive
          headerTitle={headers}
          colWidths={colWidths}
          tableData={tableData}
        />
        <ModalTable
          show={showModal}
          title={`
            ${selectedMarca} 
        
            ${selectedModelo} 
            -  
            Patente: 
            ${selectedPatente} 
           - Matafuego:
            ${
              selectedNroSerie.trim().length > 0 &&
              selectedProveedor.trim().length > 0
                ? `|| Numero de serie: ${selectedNroSerie} | Proveedor: ${selectedProveedor} ||`
                : "Sin Matafuego"
            }
          `}
          onClose={() => setShowModal(false)}>
          <ButtonEdit
            id={selectedId ? selectedId : "0"}
            endpoint={endpointFront.vehiculos.actualizar.action(
              selectedId ? parseInt(selectedId) : 0,
            )}
          />
          <AltaBajaLogica
            estado={selectedEstado}
            methodAlta={endpointsAPI.vehiculos.altaLogica.method}
            endpointBaja={endpointsAPI.vehiculos.bajaLogica.action(
              selectedId ? parseInt(selectedId) : 0,
            )}
            methodBaja={endpointsAPI.vehiculos.bajaLogica.method}
            endpointAlta={endpointsAPI.vehiculos.altaLogica.action(
              selectedId ? parseInt(selectedId) : 0,
            )}
            onChange={(nuevoEstado) => {
              setSelectedEstado(nuevoEstado);
              // Hay que actualizar el estado en la tabla tambien, sino no se ve el cambio hasta ctrl+F5
              setMetadataPage((prevData) => ({
                ...prevData,
                data: prevData.data.map((vehiculo) =>
                  String(vehiculo.idVehiculo) === String(selectedId)
                    ? { ...vehiculo, Estado: nuevoEstado }
                    : vehiculo,
                ),
              }));
              setShowModal(false);
            }}
          />
        </ModalTable>
      </TableContainer>
      <PaginatorForTable
        totalCountPages={metadataPage.totalPaginasCalculadas}
        currentPage={metadataPage.paginaActual}
        previousPage={() => {
          if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
        }}
        nextPage={() => {
          if (currentPage < metadataPage.totalPaginasCalculadas) {
            setCurrentPage(currentPage + 1);
          }
        }}
        onPageChange={(newPage) => {
          setCurrentPage(newPage);
        }}
      />

      <NavButtonPosition />
    </>
  );
}
