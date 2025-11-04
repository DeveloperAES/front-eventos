import { useState } from "react";
import api from "../api/api";

export default function ValidarQR() {
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState(null);

  const validar = async (e) => {
    e.preventDefault();
    const res = await api.get(`/registros/validar/${codigo}`);
    setResultado(res.data);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Validar QR</h2>
      <form onSubmit={validar} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Código QR"
          className="border p-2 rounded flex-1"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Validar
        </button>
      </form>

      {resultado && (
        <div
          className={`p-4 rounded-lg ${
            resultado.ok ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <p>{resultado.mensaje}</p>
          {resultado.registro && (
            <p>
              <strong>{resultado.registro.nombre}</strong> —{" "}
              {resultado.registro.evento}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
