import { useEffect, useState } from "react";
import {
  VehiculoApiParser,
  type VehiculoSchemaType,
} from "../../types/Vehiculo.schema";
import {
  NeumaticoApiParser,
  type NeumaticoType,
} from "../../types/Neumatico.schema";
import TableContainer from "../../src/Components/Table/TableContainer";
import FormCard from "../../src/Components/Form/FormCard";
import TableResponsive from "../../src/Components/Table/TableResponsive";
import ComboBoxBrowser from "../../src/Components/FormBuscador/ComboBoxBrowser";
import endpointsAPI from "../../src/Components/Routes/Enrouters";
import z from "zod";
import Swal from "sweetalert2";
import type { PaginaResponseType } from "../../types/PaginaResponse.Type";
import { PaginatorForTable } from "../../src/Components/Table/Paginator";

const geminiTheme = {
  bgPage: "#131314",
  bgSurface: "#1E1F20",
  bgInput: "#2D2E31",
  textMain: "#E3E3E3",
  textMuted: "#C4C7C5",
  accentBlue: "#A8C7FA",
  accentRed: "#F2B8B5",
  buttonBg: "#004A77",
  radius: "24px",
};

export const AsignarNeumaticos = () => {
  const [vehiculo, setVehiculo] = useState<VehiculoSchemaType | null>();
  const [neumaticoAvailableToAssign, setNeumaticoAvailableToAssign] = useState<
    PaginaResponseType<NeumaticoType>
  >({
    data: [],
    totalPaginasCalculadas: 0,
    paginaActual: 1,
    tamanoPaginas: 10,
  });
  const [currentPageAvailable, setCurrentPageAvailable] = useState(1);
  const [currentPageAssigned, setCurrentPageAssigned] = useState(1);
  const [neumaticoAssignedToVehiculo, setNeumaticoAssignedToVehiculo] =
    useState<PaginaResponseType<NeumaticoType>>({
      data: [],
      totalPaginasCalculadas: 0,
      paginaActual: 1,
      tamanoPaginas: 10,
    });
  const [reload, setReload] = useState(1);
  const [quantityNeumaticosInTable] = useState(6);
  useEffect(() => {
    if (vehiculo == null) return;
    try {
      const searchAvailableNeumaticos = async () => {
        const responseFromApi = await fetch(
          endpointsAPI.neumaticos.obtenerTodosLosNeumaticosNoAsignados.action(
            currentPageAvailable,
            quantityNeumaticosInTable,
          ),
          {
            method:
              endpointsAPI.neumaticos.obtenerTodosLosNeumaticosNoAsignados
                .method,
          },
        );
        if (!responseFromApi.ok) throw new Error("Error");
        const dataFromApi = await responseFromApi.json();
        const neumaticosParser = z.array(NeumaticoApiParser);
        setNeumaticoAvailableToAssign({
          data: neumaticosParser.parse(dataFromApi.items),
          totalPaginasCalculadas: dataFromApi.totalPaginasCalculadas,
          tamanoPaginas: dataFromApi.tamanoPaginas,
          paginaActual: dataFromApi.paginaActual,
        });
      };
      const searchNoAvailableNeumaticos = async () => {
        const responseFromApi = await fetch(
          endpointsAPI.neumaticos.obtenerTodosLosNeumaticosAsignadosAVehiculo.action(
            vehiculo!.idVehiculo!,
            currentPageAssigned,
            quantityNeumaticosInTable,
          ),
          {
            method:
              endpointsAPI.neumaticos
                .obtenerTodosLosNeumaticosAsignadosAVehiculo.method,
          },
        );
        if (!responseFromApi.ok) throw new Error("Error");
        const dataFromApi = await responseFromApi.json();
        const neumaticosParser = z.array(NeumaticoApiParser);
        setNeumaticoAssignedToVehiculo({
          data: neumaticosParser.parse(dataFromApi.items),
          totalPaginasCalculadas: dataFromApi.totalPaginasCalculadas,
          tamanoPaginas: dataFromApi.tamanoPaginas,
          paginaActual: dataFromApi.paginaActual,
        });
      };
      searchNoAvailableNeumaticos();
      searchAvailableNeumaticos();
    } catch (e) {
      console.log(e);
    }
  }, [vehiculo?.idVehiculo, reload, currentPageAssigned, currentPageAvailable]);

  const GlobalStyles = () => (
    <style>{`
      .table { --bs-table-bg: transparent; color: ${geminiTheme.textMain}; }
      .table thead th { 
          background-color: ${geminiTheme.bgInput} !important; 
          color: ${geminiTheme.textMain} !important; 
          border: none !important;
          font-weight: 500;
      }
      .table td { border-bottom: 1px solid #444746 !important; vertical-align: middle; }
      .pagination .page-link { background-color: ${geminiTheme.bgInput}; border: none; color: ${geminiTheme.textMain}; }
      .pagination .active .page-link { background-color: ${geminiTheme.accentBlue}; color: #000; }
    `}</style>
  );

  const tableDataAvailableNeumaticos = neumaticoAvailableToAssign.data.map(
    (neumatico) => (
      <tr
        key={neumatico.IdNeumatico}
        style={{ backgroundColor: geminiTheme.bgSurface }}>
        <td className="p-3 text-center">{neumatico.NroSerie}</td>
        <td className="p-3 text-center">{neumatico.Marca}</td>
        <td className="p-3 text-center">
          <button
            className="btn text-center"
            style={{
              backgroundColor: geminiTheme.buttonBg,
              color: "#D3E3FD",
              borderRadius: "50px",
              padding: "6px 20px",
              border: "none",
              fontWeight: "500",
            }}
            onClick={async () => {
              try {
                const ok = await fetch(
                  endpointsAPI.neumaticos.asignarNeumaticos.action(
                    vehiculo!.idVehiculo!,
                    neumatico.IdNeumatico!,
                  ),
                  { method: endpointsAPI.neumaticos.asignarNeumaticos.method },
                );
                if (!ok.ok) throw new Error();
                Swal.fire({
                  title: "Asignado",
                  icon: "success",
                  background: geminiTheme.bgSurface,
                  color: geminiTheme.textMain,
                });
                setReload((r) => r + 1);
              } catch (e) {
                Swal.fire({
                  icon: "error",
                  background: geminiTheme.bgSurface,
                  title: "Error",
                  text: "Ha ocurrido un error inesperado: " + e,
                });
              }
            }}>
            Asignar
          </button>
        </td>
      </tr>
    ),
  );

  const tableDataAssignedNeumaticos = () => {
    if (!neumaticoAssignedToVehiculo?.data.length) {
      return (
        <tr>
          <td
            colSpan={3}
            className="text-center p-4 text-center"
            style={{ color: geminiTheme.textMuted }}>
            No hay neumáticos asignados
          </td>
        </tr>
      );
    }
    return neumaticoAssignedToVehiculo.data.map((neumatico) => (
      <tr
        key={neumatico.IdNeumatico}
        style={{ backgroundColor: geminiTheme.bgSurface }}>
        <td className="p-3 text-center">{neumatico.NroSerie}</td>
        <td className="p-3 text-center">{neumatico.Marca}</td>
        <td className="p-3 text-center">
          <button
            className="btn "
            style={{
              backgroundColor: "#390C0C",
              color: geminiTheme.accentRed,
              borderRadius: "50px",
              padding: "6px 20px",
              border: "none",
              fontWeight: "500",
            }}
            onClick={async () => {
              try {
                const ok = await fetch(
                  endpointsAPI.neumaticos.borrarAsignacion.action(
                    neumatico.IdNeumatico!,
                  ),
                  { method: endpointsAPI.neumaticos.borrarAsignacion.method },
                );
                if (!ok.ok) throw new Error();
                Swal.fire({
                  title: "Desasignado",
                  icon: "success",
                  background: geminiTheme.bgSurface,
                  color: geminiTheme.textMain,
                });
                setReload((r) => r + 1);
              } catch (e) {
                Swal.fire({
                  icon: "error",
                  background: geminiTheme.bgSurface,
                  title: "Error",
                  text: "Ha ocurrido un error inesperado: " + e,
                });
              }
            }}>
            Desasignar
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <div
      style={{
        backgroundColor: geminiTheme.bgPage,
        borderRadius: "16px",
        minHeight: "100vh",
        padding: "24px",
        color: geminiTheme.textMain,
        fontFamily: "'Google Sans', sans-serif",
      }}>
      <GlobalStyles />
      <FormCard
        title="Gestor de Neumáticos"
        styleCard={{
          backgroundColor: geminiTheme.bgSurface,
          color: geminiTheme.textMain,
          border: "none",
          borderRadius: geminiTheme.radius,
          boxShadow: "none",
        }}>
        <FormCard
          title="Seleccionar Vehículo"
          styleCard={{
            backgroundColor: geminiTheme.bgPage,
            color: geminiTheme.textMuted,
            border: "none",
            borderRadius: "16px",
            marginBottom: "24px",
          }}>
          <div className="p-2">
            <ComboBoxBrowser
              apiUrl={endpointsAPI.vehiculos.buscarPorPatenteLike.action("")}
              apiMethod={endpointsAPI.vehiculos.buscarPorPatenteLike.method}
              onEntitySelect={(v: unknown) =>
                v ? setVehiculo(VehiculoApiParser.parse(v)) : setVehiculo(null)
              }
              defaultOption="Buscar..."
              name="patente"
              placeholder="Escriba la patente..."
            />
          </div>
        </FormCard>

        {vehiculo && (
          <div className="d-flex flex-column flex-xl-row gap-4 mt-4">
            <FormCard
              title="Neumáticos Asignados"
              styleHeader={{
                backgroundColor: geminiTheme.bgSurface,
                color: geminiTheme.textMain,
                borderBottom: `1px solid ${geminiTheme.bgInput}`,
                padding: "20px 24px",
                fontSize: "18px",
                fontWeight: "500",
                borderTopLeftRadius: "16px",
                borderTopRightRadius: "16px",
              }}
              styleCard={{
                flex: 1,
                backgroundColor: geminiTheme.bgSurface,
                border: `1px solid ${geminiTheme.bgInput}`,
                borderRadius: "16px",
                padding: "0",
              }}>
              <TableContainer title="">
                <TableResponsive
                  headerTitle={["Nro Serie", "Marca", "Accion"]}
                  colWidths={["30%", "40%", "30%"]}
                  tableData={tableDataAssignedNeumaticos()}
                />

                {neumaticoAssignedToVehiculo.data.length > 0 &&
                  neumaticoAssignedToVehiculo.totalPaginasCalculadas > 1 && (
                    <div className="p-3 d-flex justify-content-center">
                      <PaginatorForTable
                        nextPage={() =>
                          currentPageAssigned <
                            neumaticoAssignedToVehiculo.totalPaginasCalculadas &&
                          setCurrentPageAssigned((c) => c + 1)
                        }
                        previousPage={() =>
                          currentPageAssigned > 1 &&
                          setCurrentPageAssigned((c) => c - 1)
                        }
                        onPageChange={setCurrentPageAssigned}
                        currentPage={currentPageAssigned}
                        totalCountPages={
                          neumaticoAssignedToVehiculo.totalPaginasCalculadas
                        }
                      />
                    </div>
                  )}
              </TableContainer>
            </FormCard>

            <FormCard
              title="Stock Disponible"
              styleHeader={{
                backgroundColor: geminiTheme.bgSurface,
                color: geminiTheme.textMain,
                borderBottom: `1px solid ${geminiTheme.bgInput}`,
                padding: "20px 24px",
                fontSize: "18px",
                fontWeight: "500",
                borderTopLeftRadius: "16px",
                borderTopRightRadius: "16px",
              }}
              styleCard={{
                flex: 1,
                backgroundColor: geminiTheme.bgSurface,
                border: `1px solid ${geminiTheme.bgInput}`,
                borderRadius: "16px",
                padding: "0",
              }}>
              <TableContainer title="">
                <TableResponsive
                  colWidths={["30%", "40%", "30%"]}
                  headerTitle={["Nro Serie", "Marca", "Accion"]}
                  tableData={
                    tableDataAvailableNeumaticos.length > 0
                      ? tableDataAvailableNeumaticos
                      : [
                          <tr key="0">
                            <td
                              colSpan={3}
                              className="text-center p-4 "
                              style={{ color: geminiTheme.textMuted }}>
                              Sin Stock
                            </td>
                          </tr>,
                        ]
                  }
                />

                {tableDataAvailableNeumaticos.length > 0 &&
                  neumaticoAvailableToAssign.totalPaginasCalculadas > 1 && (
                    <div className="p-3 d-flex justify-content-center">
                      <PaginatorForTable
                        nextPage={() =>
                          currentPageAvailable <
                            neumaticoAvailableToAssign.totalPaginasCalculadas &&
                          setCurrentPageAvailable((c) => c + 1)
                        }
                        previousPage={() =>
                          currentPageAvailable > 1 &&
                          setCurrentPageAvailable((c) => c - 1)
                        }
                        onPageChange={setCurrentPageAvailable}
                        currentPage={currentPageAvailable}
                        totalCountPages={
                          neumaticoAvailableToAssign.totalPaginasCalculadas
                        }
                      />
                    </div>
                  )}
              </TableContainer>
            </FormCard>
          </div>
        )}
      </FormCard>
    </div>
  );
};
