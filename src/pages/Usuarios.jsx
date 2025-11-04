import { useEffect, useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";

export default function Usuarios() {
  const [registros, setRegistros] = useState([]);
  const [confirmandoId, setConfirmandoId] = useState(null);

  useEffect(() => {
    const fetchRegistros = async () => {
      try {
        const res = await api.get("/registros/listar");
        setRegistros(res.data);
      } catch (error) {
        console.error("Error al cargar registros:", error);
        toast.error("Error al cargar registros.");
      }
    };
    fetchRegistros();
  }, []);


  const reenviarRecordatorios = async () => {
    try {
      const confirm = window.confirm("¿Deseas enviar correos a todos los confirmados?");
      if (!confirm) return;

      const loadingToast = toast.loading("Enviando correos...");

      const res = await api.post("/registros/reenviar-recordatorios");

      toast.dismiss(loadingToast);
      toast.success(res.data.mensaje);
    } catch (error) {
      toast.dismiss();
      console.error("Error al reenviar correos:", error.response?.data || error);
      toast.error("Error al reenviar correos");
    }
  };



  const confirmar = async (id) => {
    if (!confirm("¿Confirmar este registro?")) return;
    setConfirmandoId(id);

    try {
      await api.post(`/registros/confirmar/${id}`);
      setRegistros((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, estado: "confirmado" } : r
        )
      );

      toast.success("Registro confirmado y correo enviado 🎉");
    } catch (error) {
      console.error("Error al confirmar:", error);
      toast.error("Error al confirmar. Intenta nuevamente.");
    } finally {
      setConfirmandoId(null);
    }
  };

  return (
    <div>
   
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Usuarios registrados</h2>
        <button
          onClick={reenviarRecordatorios}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Enviar recordatorios
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 bg-white rounded-lg overflow-hidden shadow-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="border p-2">#</th>
              <th className="border p-2">ID</th>
              <th className="border p-2">Usuario</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Evento</th>
              <th className="border p-2">Estado</th>
              <th className="border p-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((r, i) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="border p-2 text-center">{i + 1}</td>
                <td className="border p-2 text-center">{r.id}</td>
                <td className="border p-2">{r.usuario}</td>
                <td className="border p-2">{r.email}</td>
                <td className="border p-2">{r.evento}</td>
                <td className="border p-2 capitalize text-center">
                  {r.estado}
                </td>
                <td className="border p-2 text-center">
                  {r.estado === "registrado" ? (
                    <button
                      onClick={() => confirmar(r.id)}
                      disabled={confirmandoId === r.id}
                      className={`${confirmandoId === r.id
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                        } text-white px-3 py-1 rounded flex items-center justify-center gap-2`}
                    >
                      {confirmandoId === r.id ? (
                        <>
                          <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Confirmando...
                        </>
                      ) : (
                        "Confirmar"
                      )}
                    </button>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
