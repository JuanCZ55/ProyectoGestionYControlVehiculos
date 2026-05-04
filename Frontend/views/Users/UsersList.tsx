import { useEffect, useState } from "react";
import ModalTable from "../../src/Components/Table/ModalTable";
import { PaginatorForTable } from "../../src/Components/Table/Paginator";
import TableContainer from "../../src/Components/Table/TableContainer";
import TableResponsive from "../../src/Components/Table/TableResponsive";
import { UsuarioApiParser, type UsuarioType } from "../../types/Usuario.schema";
import { type PaginaResponseType } from "../../types/PaginaResponse.Type";
import endpointsAPI from "../../src/Components/Routes/Enrouters";
import z from "zod";
import AltaBajaLogica from "../../src/Components/Table/AltaBajaLogica";
import Swal from "sweetalert2";
import { getUserFromToken } from "../../src/Utils/Auth";
export default function UsersList() {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UsuarioType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [metadataPage, setMetadataPage] = useState<
    PaginaResponseType<UsuarioType>
  >({
    data: [],
    totalPaginasCalculadas: 0,
    paginaActual: 1,
    tamanoPaginas: 10,
  });
  const handleRowClick = (usuario: UsuarioType) => {
    setSelectedUser(usuario);
    setShowModal(true);
  };
  const handleError = (error: unknown) => {
    Swal.fire({
      title: "Error al cargar los usuarios",
      text:
        error instanceof Error
          ? error.message
          : "Ha ocurrido un error inesperado",
      icon: "error",
      showCloseButton: true,
    });
  };
  useEffect(() => {
    console.log(
      "SUB" + getUserFromToken()?.sub + "ID" + selectedUser?.idUsuario,
    );
  });
  const tableData = metadataPage.data.map((usuario: UsuarioType) => (
    <tr
      key={usuario.idUsuario}
      onClick={() => handleRowClick(usuario)}
      style={{ cursor: "pointer", textAlign: "center" }}>
      <td>{usuario.persona!.nombre}</td>
      <td>{usuario.persona!.apellido}</td>
      <td>{usuario.persona!.dni}</td>
      <td>{usuario.gmail}</td>
      <td>{usuario.rol?.nombre}</td>
      <td>{usuario.estado ? "Activo" : "Inactivo"}</td>
    </tr>
  ));
  const handleChangeRole = async () => {
    try {
      const responseFromApi = await fetch(
        endpointsAPI.usuarios.cambiarRol.action(selectedUser!.idUsuario),
        {
          method: endpointsAPI.usuarios.cambiarRol.method,
        },
      );
      if (responseFromApi.ok) {
        const dataFromApi = await responseFromApi.json();
        selectedUser!.idRol = dataFromApi.idRol;
        selectedUser!.rol!.idRol = dataFromApi.idRol;
        selectedUser!.rol!.nombre = dataFromApi.nombre;

        setMetadataPage((prevData) => ({
          ...prevData,
          data: prevData.data.map((usuario) => {
            if (String(usuario.idUsuario) === String(selectedUser!.idUsuario)) {
              return {
                ...usuario,
                idRol: dataFromApi.idRol,
                rol: {
                  estado: selectedUser!.rol!.estado,
                  idRol: dataFromApi.idRol,
                  nombre: dataFromApi.nombre,
                },
              };
            }
            return usuario;
          }),
        }));
        return;
      }
      setShowModal(false);

      const rawText = await responseFromApi.text();
      throw new Error("" + rawText);
    } catch (error) {
      Swal.fire({
        title: "Error al cambiar el rol: ",
        text:
          error instanceof Error
            ? error.message
            : "Ha ocurrido un error inesperado",
        icon: "error",
        showCloseButton: true,
      });
    }
  };
  const confirmarAccionPeligrosa = (funcionAEjecutar: () => void): void => {
    setShowModal(false);

    Swal.fire({
      title: "¿Estás absolutamente seguro?",
      text: 'Esta acción es irreversible. Escribe la palabra "Confirmar" para continuar:',
      input: "text",
      inputPlaceholder: "Escribe Confirmar",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, ejecutar",
      cancelButtonText: "Cancelar",
      didOpen: () => {
        const confirmButton = Swal.getConfirmButton();
        const input = Swal.getInput();

        if (confirmButton) {
          confirmButton.disabled = true;
        }

        if (input) {
          input.addEventListener("input", () => {
            if (confirmButton) {
              confirmButton.disabled = input.value !== "Confirmar";
            }
          });
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        funcionAEjecutar();
        return;
      }
      if (result.isDismissed) {
        setShowModal(true);
        return;
      }
    });
  };
  const handleResetPassword = async () => {
    try {
      const responseFromApi = await fetch(
        endpointsAPI.usuarios.resetPassword.action(selectedUser!.idUsuario),
        {
          method: endpointsAPI.usuarios.resetPassword.method,
        },
      );
      if (responseFromApi.ok) {
        const rawText = await responseFromApi.json();

        Swal.fire({
          title: `Contraseña reseteada | Usuario: ${selectedUser!.gmail}`,
          text: `${"" + rawText.message}`,
          icon: "success",
          showCloseButton: true,
        }).then(() => {
          setShowModal(true);
        });
        return;
      }
      const errorMessage = await responseFromApi.text();
      throw new Error(errorMessage + "");
    } catch (error) {
      Swal.fire({
        title: "Error al resetear la contraseña: ",
        text:
          error instanceof Error
            ? error.message
            : "Ha ocurrido un error inesperado",
        icon: "error",
        showCloseButton: true,
      });
    }
  };
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const responseFromApi = await fetch(
          endpointsAPI.usuarios.listar.action(currentPage, 10),
          {
            method: endpointsAPI.usuarios.listar.method,
          },
        );
        if (!responseFromApi.ok) {
          throw new Error("Error en la respuesta del servidor");
        }
        const dataFromApi = await responseFromApi.json();
        console.log(dataFromApi);
        const usersParser = z.array(UsuarioApiParser);
        const usersParsedFromApi: UsuarioType[] = usersParser.parse(
          dataFromApi.items,
        );
        console.log("No paso");
        const dataParsed: PaginaResponseType<UsuarioType> = {
          data: usersParsedFromApi,
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
    fetchUsers();
  }, [currentPage]);
  return (
    <>
      <TableContainer title="Listado de Usuarios">
        <TableResponsive
          headerTitle={["Nombre", "Apellido", "DNI", "Gmail", "Rol", "Estado"]}
          tableData={tableData}></TableResponsive>
      </TableContainer>
      <ModalTable
        show={showModal}
        title={
          (selectedUser &&
            "Usuario: " +
              selectedUser.persona!.nombre +
              " " +
              selectedUser.persona!.apellido +
              " - Gmail: " +
              selectedUser.gmail +
              "- Rol: " +
              selectedUser.rol?.nombre) ||
          "Detalle de el usuario"
        }
        onClose={() => setShowModal(false)}>
        {selectedUser && (
          <>
            {selectedUser.idUsuario != getUserFromToken()!.sub && (
              <AltaBajaLogica
                endpointAlta={endpointsAPI.usuarios.alta.action(
                  selectedUser.idUsuario,
                )}
                methodAlta={endpointsAPI.usuarios.alta.method}
                endpointBaja={endpointsAPI.usuarios.baja.action(
                  selectedUser.idUsuario,
                )}
                methodBaja={endpointsAPI.usuarios.baja.method}
                estado={selectedUser.estado}
                onChange={(nuevoEstado) => {
                  selectedUser.estado = nuevoEstado;
                  setMetadataPage((prevData) => ({
                    ...prevData,
                    data: prevData.data.map((usuario) => {
                      if (
                        String(usuario.idUsuario) ===
                        String(selectedUser.idUsuario)
                      ) {
                        return { ...usuario, estado: nuevoEstado };
                      }
                      return usuario;
                    }),
                  }));
                }}></AltaBajaLogica>
            )}
            <button
              className="btn btn-primary"
              onClick={handleChangeRole}>{`Cambiar Rol`}</button>
            <button
              className="btn btn-dark"
              onClick={() => confirmarAccionPeligrosa(handleResetPassword)}>
              {"Resetear Contraseña"}
            </button>
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
    </>
  );
}
