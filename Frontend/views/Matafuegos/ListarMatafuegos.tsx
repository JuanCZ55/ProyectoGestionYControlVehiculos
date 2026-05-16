import { useEffect, useState } from "react";
import {
  MatafuegoApiParser,
  type MatafuegoType,
} from "../../types/Matafuego.schema";
import { type PaginaResponseType } from "../../types/PaginaResponse.Type";
import Swal from "sweetalert2";
import {
  endpointFront,
  endpointsAPI,
} from "../../src/Components/Routes/Enrouters";
import { z } from "zod";
import TableContainer from "../../src/Components/Table/TableContainer";
import TableResponsive from "../../src/Components/Table/TableResponsive";
import ModalTable from "../../src/Components/Table/ModalTable";
import { ParserDatesToStringMessage } from "../../src/Utils/ParserDatesToStringMessage";
import { ButtonEdit } from "../../src/Components/Table/ModalTableButtonsAll";
import { PaginatorForTable } from "../../src/Components/Table/Paginator";
import AltaBajaLogica from "../../src/Components/Table/AltaBajaLogica";
import { NavButtonPosition } from "../../src/Components";
import { confirmarAccionPeligrosa } from "../../src/Components/confirmarAccionPeligrosa";
export const ListarMatafuegos = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedMatafuego, setSelectedMatafuego] =
    useState<MatafuegoType | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [metadataPage, setMetadataPage] = useState<
    PaginaResponseType<MatafuegoType>
  >({
    data: [],
    totalPaginasCalculadas: 0,
    paginaActual: 1,
    tamanoPaginas: 10,
  });
  const handleRowClick = (matafuego: MatafuegoType) => {
    setSelectedMatafuego(matafuego);
    setShowModal(true);
  };
  const handleError = (error: unknown) => {
    Swal.fire({
      title: "Error al cargar los matafuegos",
      text:
        error instanceof Error
          ? error.message
          : "Ha ocurrido un error inesperado",
      icon: "error",
      showCloseButton: true,
    });
  };
  useEffect(() => {
    const fetchMatafuegos = async () => {
      try {
        const responseFromApi = await fetch(
          endpointsAPI.matafuegos.listar.action(currentPage, 10),
          {
            method: endpointsAPI.matafuegos.listar.method,
          },
        );
        if (!responseFromApi.ok) {
          throw new Error("Error en la respuesta del servidor");
        }

        const dataFromApi = await responseFromApi.json();
        const matafuegosParser = z.array(MatafuegoApiParser);
        const matafuegosParsedFromApi: MatafuegoType[] = matafuegosParser.parse(
          dataFromApi.items,
        );
        const dataParsed: PaginaResponseType<MatafuegoType> = {
          data: matafuegosParsedFromApi,
          totalPaginasCalculadas: dataFromApi.totalPaginasCalculadas,
          tamanoPaginas: dataFromApi.tamanoPaginas,
          paginaActual: dataFromApi.paginaActual,
        };
        //console.log(dataParsed);

        setMetadataPage(dataParsed);
      } catch (error) {
        handleError(error);
        return;
      }
    };
    fetchMatafuegos();
  }, [currentPage]);
  const tableData = metadataPage.data.map((matafuego: MatafuegoType) => (
    <tr
      key={matafuego.IdMatafuego}
      onClick={() => handleRowClick(matafuego)}
      style={{ cursor: "pointer", textAlign: "center" }}>
      <td>{matafuego.NroSerie}</td>
      <td>{matafuego.Proveedor}</td>
      <td>{matafuego.FechaCarga.toISOString().split("T")[0]}</td>
      <td>{matafuego.FechaVencimiento.toISOString().split("T")[0]}</td>
      <td>{matafuego.Estado ? "Activo" : "Inactivo"}</td>
    </tr>
  ));
  return (
    <>
      <TableContainer title="Listado de Matafuegos">
        <TableResponsive
          headerTitle={[
            "NroSerie",
            "Proveedor",
            "Fecha de Carga",
            "Fecha de Vencimiento",
            "Estado",
          ]}
          tableData={tableData}
        />

        <ModalTable
          show={showModal}
          title={
            (selectedMatafuego &&
              "NroSerie: " +
                selectedMatafuego?.NroSerie +
                " - Proveedor: " +
                selectedMatafuego?.Proveedor +
                " - Fecha de Carga: " +
                ParserDatesToStringMessage(selectedMatafuego!.FechaCarga) +
                " - Fecha de Vencimiento: " +
                ParserDatesToStringMessage(
                  selectedMatafuego!.FechaVencimiento,
                ) +
                " - Estado: " +
                (selectedMatafuego!.Estado ? "Activo" : "Inactivo")) ||
            "Detalle del Matafuego"
          }
          onClose={() => setShowModal(false)}>
          {selectedMatafuego && (
            <>
              <ButtonEdit
                id={selectedMatafuego!.IdMatafuego!.toString()}
                endpoint={endpointFront.matafuegos.editar.action(
                  selectedMatafuego!.IdMatafuego!,
                )}
              />
              <AltaBajaLogica
                endpointAlta={endpointsAPI.matafuegos.altaLogica.action(
                  selectedMatafuego && selectedMatafuego.IdMatafuego
                    ? selectedMatafuego.IdMatafuego
                    : 0,
                )}
                methodAlta={endpointsAPI.matafuegos.altaLogica.method}
                endpointBaja={endpointsAPI.matafuegos.bajaLogica.action(
                  selectedMatafuego && selectedMatafuego.IdMatafuego
                    ? selectedMatafuego.IdMatafuego
                    : 0,
                )}
                methodBaja={endpointsAPI.matafuegos.bajaLogica.method}
                estado={selectedMatafuego!.Estado!}
                onChange={(nuevoEstado) => {
                  selectedMatafuego.Estado = nuevoEstado;
                  setMetadataPage((prevData) => ({
                    ...prevData,
                    data: prevData.data.map((matafuego) => {
                      if (
                        String(matafuego.IdMatafuego) ===
                        String(selectedMatafuego.IdMatafuego)
                      ) {
                        return { ...matafuego, Estado: nuevoEstado };
                      }
                      return matafuego;
                    }),
                  }));
                }}></AltaBajaLogica>
              <ButtonEdit
                id={selectedMatafuego!.IdMatafuego!.toString()}
                endpoint={endpointFront.matafuegos.editar.action(
                  selectedMatafuego!.IdMatafuego!,
                )}
              />
            </>
          )}
        </ModalTable>
        <PaginatorForTable
          nextPage={() => {
            if (currentPage < metadataPage.totalPaginasCalculadas)
              setCurrentPage(currentPage + 1);
          }}
          previousPage={() => {
            if (currentPage > 1) setCurrentPage(currentPage - 1);
          }}
          onPageChange={(newPage) => setCurrentPage(newPage)}
          currentPage={currentPage}
          totalCountPages={
            metadataPage.totalPaginasCalculadas
          }></PaginatorForTable>
      </TableContainer>
      <NavButtonPosition />
    </>
  );
};
