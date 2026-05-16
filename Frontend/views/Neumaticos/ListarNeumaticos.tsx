import { useEffect, useState } from "react";
import {
  NeumaticoApiParser,
  type NeumaticoType,
} from "../../types/Neumatico.schema";
import { type PaginaResponseType } from "../../types/PaginaResponse.Type";
import Swal from "sweetalert2";
import TableContainer from "../../src/Components/Table/TableContainer";
import TableResponsive from "../../src/Components/Table/TableResponsive";
import ModalTable from "../../src/Components/Table/ModalTable";
import { ButtonEdit } from "../../src/Components/Table/ModalTableButtonsAll";
import {
  endpointFront,
  endpointsAPI,
} from "../../src/Components/Routes/Enrouters";
import AltaBajaLogica from "../../src/Components/Table/AltaBajaLogica";
import { PaginatorForTable } from "../../src/Components/Table/Paginator";
import z from "zod";
import { NavButtonPosition } from "../../src/Components";
import { confirmarAccionPeligrosa } from "../../src/Components/confirmarAccionPeligrosa";
import { getUserFromToken } from "../../src/Utils/Auth";

export const ListarNeumaticos = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedNeumatico, setSelectedNeumatico] =
    useState<NeumaticoType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [reloadPage, setReloadPage] = useState(0);
  const [metadataPage, setMetadataPage] = useState<
    PaginaResponseType<NeumaticoType>
  >({
    data: [],
    totalPaginasCalculadas: 0,
    paginaActual: 1,
    tamanoPaginas: 10,
  });
  const handleRowClick = (neumatico: NeumaticoType) => {
    setSelectedNeumatico(neumatico);
    setShowModal(true);
  };
  const handleError = (error: unknown) => {
    Swal.fire({
      title: "Error al cargar los neumaticos",
      text:
        error instanceof Error
          ? error.message
          : "Ha ocurrido un error inesperado",
      icon: "error",
      showCloseButton: true,
    });
  };
  const handleDelete = async () => {
    if (!selectedNeumatico) return;

    try {
      const response = await fetch(
        endpointsAPI.neumaticos.eliminar.action(selectedNeumatico.IdNeumatico!),
        {
          method: endpointsAPI.neumaticos.eliminar.method,
        },
      );
      if (response.ok) {
        Swal.fire({
          title: "Neumático eliminado",
          text: "El neumático ha sido eliminado correctamente.",
          icon: "success",
          showCloseButton: true,
        });
        setReloadPage((prev) => prev + 1);
        return;
      }
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || "Error al eliminar el neumático");
    } catch (error) {
      Swal.fire({
        title: "Error al eliminar el neumático",
        text:
          error instanceof Error
            ? error.message
            : "Ha ocurrido un error inesperado",
        icon: "error",
        showCloseButton: true,
      });
    }
  };
  const tableData = metadataPage.data.map((neumatico: NeumaticoType) => (
    <tr
      key={neumatico.IdNeumatico}
      onClick={() => handleRowClick(neumatico)}
      style={{ cursor: "pointer", textAlign: "center" }}>
      <td>{neumatico.NroSerie}</td>
      <td>{neumatico.Marca}</td>
      <td>{neumatico.Medida}</td>
      <td>{neumatico.Estandar ? "Estandar" : "Recapado"}</td>
      <td>{neumatico.KmColocacion}</td>
      <td>{neumatico.KmRodados}</td>
      <td>{neumatico.DesgasteIrregular ? "Irregular" : "Normal"}</td>
      <td>{neumatico.Estado ? "Activo" : "Inactivo"}</td>
    </tr>
  ));
  useEffect(() => {
    const fetchNeumaticos = async () => {
      try {
        const responseFromApi = await fetch(
          endpointsAPI.neumaticos.listar.action(currentPage, 10),
          {
            method: endpointsAPI.neumaticos.listar.method,
          },
        );
        if (!responseFromApi.ok) {
          throw new Error("Error en la respuesta del servidor");
        }
        const dataFromApi = await responseFromApi.json();
        console.log(dataFromApi);
        const neumaticosParser = z.array(NeumaticoApiParser);
        const neumaticosParsedFromApi: NeumaticoType[] = neumaticosParser.parse(
          dataFromApi.items,
        );
        console.log("No paso");
        const dataParsed: PaginaResponseType<NeumaticoType> = {
          data: neumaticosParsedFromApi,
          totalPaginasCalculadas: dataFromApi.totalPaginasCalculadas,
          tamanoPaginas: dataFromApi.tamanoPaginas,
          paginaActual: dataFromApi.paginaActual,
        };
        setMetadataPage(dataParsed);
      } catch (error) {
        handleError(error);
        return;
      }
    };
    fetchNeumaticos();
  }, [currentPage, reloadPage]);
  return (
    <>
      <TableContainer title="Listado de Neumaticos">
        <TableResponsive
          headerTitle={[
            "NroSerie",
            "Marca",
            "Medida",
            "Estandar",
            "KmColocacion",
            "KmRodados",
            "Desgaste",
            "Estado",
          ]}
          tableData={tableData}></TableResponsive>
        <ModalTable
          show={showModal}
          title={
            (selectedNeumatico &&
              "NroSerie: " +
                selectedNeumatico.NroSerie +
                " Marca: " +
                selectedNeumatico.Marca +
                " Medida: " +
                selectedNeumatico.Medida +
                " Estandar: " +
                (selectedNeumatico.Estandar ? "Estandar" : "Recapado") +
                " KmColocacion: " +
                selectedNeumatico.KmColocacion +
                " KmRodados: " +
                selectedNeumatico.KmRodados +
                " Desgaste: " +
                (selectedNeumatico.DesgasteIrregular ? "Irregular" : "Normal") +
                " Estado: " +
                (selectedNeumatico.Estado ? "Activo" : "Inactivo")) ||
            "Detalle del Neumatico"
          }
          onClose={() => setShowModal(false)}>
          {selectedNeumatico && (
            <>
              <ButtonEdit
                id={selectedNeumatico!.IdNeumatico!.toString()}
                endpoint={endpointFront.neumaticos.editar.action(
                  selectedNeumatico.IdNeumatico!,
                )}
              />
              <AltaBajaLogica
                endpointAlta={endpointsAPI.neumaticos.altaLogica.action(
                  selectedNeumatico && selectedNeumatico.IdNeumatico
                    ? selectedNeumatico.IdNeumatico
                    : 0,
                )}
                methodAlta={endpointsAPI.neumaticos.altaLogica.method}
                endpointBaja={endpointsAPI.neumaticos.bajaLogica.action(
                  selectedNeumatico && selectedNeumatico.IdNeumatico
                    ? selectedNeumatico.IdNeumatico
                    : 0,
                )}
                methodBaja={endpointsAPI.neumaticos.bajaLogica.method}
                estado={selectedNeumatico!.Estado!}
                onChange={(nuevoEstado) => {
                  selectedNeumatico.Estado = nuevoEstado;
                  setMetadataPage((prevData) => ({
                    ...prevData,
                    data: prevData.data.map((neumatico) => {
                      if (
                        String(neumatico.IdNeumatico) ===
                        String(selectedNeumatico.IdNeumatico)
                      ) {
                        return { ...neumatico, Estado: nuevoEstado };
                      }
                      return neumatico;
                    }),
                  }));
                }}></AltaBajaLogica>
              {getUserFromToken()?.role == 1 && (
                <button
                  className="btn btn-dark"
                  onClick={() =>
                    confirmarAccionPeligrosa(
                      handleDelete,
                      setShowModal,
                      "Si elimina el neumático, se desasociara de los vehiculos relacionados. ¿Confirma que desea eliminar el neumático?",
                      'Esta acción es irreversible. Escribe la palabra "Confirmar" para continuar:',
                    )
                  }>
                  {"Eliminar Neumático"}
                </button>
              )}
            </>
          )}
        </ModalTable>
        <PaginatorForTable
          nextPage={() => {
            if (currentPage < metadataPage.totalPaginasCalculadas) {
              setCurrentPage(currentPage + 1);
            }
          }}
          previousPage={() => {
            if (currentPage > 1) setCurrentPage(currentPage - 1);
          }}
          onPageChange={(newPage) => {
            setCurrentPage(newPage);
          }}
          currentPage={currentPage}
          totalCountPages={
            metadataPage.totalPaginasCalculadas
          }></PaginatorForTable>
        <NavButtonPosition />
      </TableContainer>
    </>
  );
};
