import FormBrowser from "../../src/Components/FormBuscador/FormBrowser";
import GeneralContainer from "../../src/Components/FormBuscador/GeneralContainer";
import ResultInfo from "../../src/Components/FormBuscador/ResultInfo";
import NavButtonPosition from "../../src/Components/NavButtonPosition";
import Enrouters from "../../src/Components/Routes/Enrouters";
import ContainerCargador from "../../src/Components/CargadorDeArchivos/ContainerCargador";
import { useState } from "react";
import type { ApiMatafuegoType } from "../../types/Matafuego.schema";
import DocumentosMatafuegosHandler from "../../src/Components/Handlers/DocumentosMatafuegosHandler";

export default function MatafuegoDocumentos() {
  const [showCargador, setShowCargador] = useState(false);
  const [idMatafuego, setIdMatafuego] = useState<number | null>(null);
  const [tipoDoc, setTipoDoc] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [idDocumentoViejo, setIdDocumentoViejo] = useState<number>(0);
  const entity = "Matafuego";

  const handleMatafuegoSelect = (matafuego: {
    [key: string]: string | number;
  }) => {
    if (matafuego && matafuego.idMatafuego) {
      setIdMatafuego(parseInt(matafuego.idMatafuego.toString()));
    }
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
      <GeneralContainer title="Gestión de Documentos de Matafuegos">
        <FormBrowser
          searchApiUrl={Enrouters.matafuegos.buscarPorNroSerie.action("")}
          searchApiMethod={Enrouters.matafuegos.buscarPorNroSerie.method}
          relatedApiUrl={(matafuego: ApiMatafuegoType) =>
            Enrouters.documentos.buscarPorMatafuegoId.action(
              matafuego.idMatafuego!,
            )
          }
          relatedApiMethod={Enrouters.documentos.buscarPorMatafuegoId.method}
          entityLabel={entity}
          defaultOption="Ingrese el Numero de Serie "
          onEntitySelect={handleMatafuegoSelect}
          renderEntity={(matafuego) => (
            <ResultInfo
              title={entity}
              info={[
                { label: "NroSerie", value: matafuego.nroSerie },
                { label: "Modelo", value: matafuego.proveedor },
                { label: "Año", value: matafuego.fechaCarga },
                { label: "Patente", value: matafuego.fechaVencimiento },
              ]}
            />
          )}
          refresh={refreshKey}
          renderRelated={(docs) => (
            <DocumentosMatafuegosHandler
              docs={docs}
              onCargar={handleCargar}
              onSuccess={handleRefresh}
            />
          )}
        />
        {/* Hasta aca llegaria lo que seria la pagina, Este bonton seria el volver */}
        <NavButtonPosition />
        <ContainerCargador
          show={showCargador}
          onHide={() => setShowCargador(false)}
          idMatafuego={idMatafuego || undefined}
          tipoDocumento={tipoDoc}
          entityLabel={entity}
          onSuccess={handleRefresh}
          idDocumentoViejo={idDocumentoViejo}
        />
      </GeneralContainer>
    </>
  );
}
