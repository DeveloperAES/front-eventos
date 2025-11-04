import { useEffect, useState } from "react";
import api from "../api/api";

export default function AdminPanel() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const cargarUsuarios = async () => {
    try {
      const res = await api.get("/registros/listar");
      setUsuarios(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const confirmarUsuario = async (id) => {
    try {
      setMensaje("Enviando confirmación...");
      await api.post(`/registros/confirmar/${id}`);
      setMensaje("Correo enviado y estado actualizado ✅");
      cargarUsuarios();
    } catch (err) {
      console.error(err);
      setMensaje("Error al confirmar ❌");
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  if (loading) return <p className="text-center mt-10">Cargando...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-blue-700">
        Lista de Registros
      </h2>
      {mensaje && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          {mensaje}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Nombre</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Evento</th>
              <th className="px-4 py-2 border">Estado</th>
              <th className="px-4 py-2 border text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-2">{u.id}</td>
                <td className="px-4 py-2">{u.usuario}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.evento || "—"}</td>
                <td className="px-4 py-2 capitalize">{u.estado}</td>
                <td className="px-4 py-2 text-center">
                  {u.estado === "pendiente" ? (
                    <button
                      onClick={() => confirmarUsuario(u.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Confirmar
                    </button>
                  ) : (
                    <span className="text-green-600 font-semibold">✔️</span>
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
