import FormBrowser from "../src/Components/FormBuscador/FormBrowser";
import GeneralContainer from "../src/Components/FormBuscador/GeneralContainer";
import ResultInfo from "../src/Components/FormBuscador/ResultInfo";
import NavButtonPosition from "../src/Components/NavButtonPosition";
import Enrouters from "../src/Components/Routes/Enrouters";
import DocumentosVehiculosHandler from "../src/Components/Handlers/DocumentosVehiculosHandler";
import ContainerCargador from "../src/Components/CargadorDeArchivos/ContainerCargador";
import { useState } from "react";
import type { VehiculoSchemaType } from "../types/Vehiculo.schema";

export default function VehiculosDocumentos() {
  const [showCargador, setShowCargador] = useState(false);
  const [idVehiculo, setIdVehiculo] = useState<number | null>(null);
  const [tipoDoc, setTipoDoc] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [idDocumentoViejo, setIdDocumentoViejo] = useState<number>(0);
  const entity = "Vehiculo";

  const handleVehiculoSelect = (vehiculo: {
    [key: string]: string | number;
  }) => {
    console.log("Vehículo seleccionado:", vehiculo);
    setIdVehiculo(parseInt(vehiculo.idVehiculo.toString()));
  };
  const handleRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };
  const handleCargar = (tipo: string, idDocumentoViejoFromParams?: number) => {
    setTipoDoc(tipo);
    if (idDocumentoViejoFromParams)
      setIdDocumentoViejo(idDocumentoViejoFromParams);
    setShowCargador(true);
  };
  return (
    <>
      <GeneralContainer title="Gestión de Documentos de Vehículos">
        <FormBrowser
          searchApiUrl={Enrouters.vehiculos.buscarPorPatenteLike.action("")}
          searchApiMethod={Enrouters.vehiculos.buscarPorPatenteLike.method}
          relatedApiUrl={(vehicle: VehiculoSchemaType) =>
            Enrouters.documentos.buscarPorVehiculoId.action(vehicle.idVehiculo!)
          }
          relatedApiMethod={Enrouters.documentos.buscarPorVehiculoId.method}
          entityLabel={entity}
          defaultOption="Buscar vehículo por patente"
          onEntitySelect={handleVehiculoSelect}
          renderEntity={(vehicle) => (
            <ResultInfo
              title={entity}
              info={[
                { label: "Marca", value: vehicle.marca },
                { label: "Modelo", value: vehicle.modelo },
                { label: "Año", value: vehicle.anio },
                { label: "Patente", value: vehicle.patente },
              ]}
            />
          )}
          refresh={refreshKey}
          renderRelated={(docs) => (
            <DocumentosVehiculosHandler
              docs={docs}
              onCargar={handleCargar}
              onSuccess={handleRefresh}
            />
          )}
        />
        <NavButtonPosition />
        <ContainerCargador
          show={showCargador}
          onHide={() => setShowCargador(false)}
          idVehiculo={idVehiculo || undefined}
          tipoDocumento={tipoDoc}
          entityLabel={entity}
          onSuccess={handleRefresh}
          idDocumentoViejo={idDocumentoViejo}
        />
      </GeneralContainer>
    </>
  );
}
