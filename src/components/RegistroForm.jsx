import { useState } from "react";
import api from "../api/api";

export default function RegistroForm() {
  const [form, setForm] = useState({
    dni: "",
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    empresa: "",
    evento_id: 1, // ajusta según corresponda
  });

  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const corporativoRegex =
    /^[a-zA-Z0-9._%+-]+@(?!gmail\.com|hotmail\.com|outlook\.com|yahoo\.com)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    // Validación rápida frontend
    if (!corporativoRegex.test(form.email)) {
      setMensaje("❌ Solo se permiten correos corporativos (no Gmail, Hotmail, etc.)");
      return;
    }

    setLoading(true);

    try {
      // Paso 1: Registrar usuario
      const { data: user } = await api.post("/usuarios/registrar", form);

      // Paso 2: Registrar en evento
      await api.post("/registros/registrar", {
        usuario_id: user.usuario_id,
        evento_id: form.evento_id,
      });

      setMensaje("✅ Registro completado correctamente.");
      setForm({
        dni: "",
        nombres: "",
        apellidos: "",
        email: "",
        telefono: "",
        empresa: "",
        evento_id: 1,
      });
    } catch (err) {
      console.error(err);

      // Capturamos el mensaje del backend
      const errorMsg =
        err.response?.data?.error || "❌ Error al registrar. Intenta nuevamente.";
      setMensaje(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">
        Registro al Evento
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="dni"
          placeholder="DNI"
          className="w-full border p-2 rounded"
          value={form.dni}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="nombres"
          placeholder="Nombres"
          className="w-full border p-2 rounded"
          value={form.nombres}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="apellidos"
          placeholder="Apellidos"
          className="w-full border p-2 rounded"
          value={form.apellidos}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Correo corporativo"
          className="w-full border p-2 rounded"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="telefono"
          placeholder="Teléfono"
          className="w-full border p-2 rounded"
          value={form.telefono}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="empresa"
          placeholder="Empresa"
          className="w-full border p-2 rounded"
          value={form.empresa}
          onChange={handleChange}
          required
        />

        {/* Campo oculto del evento */}
        <input type="hidden" name="evento_id" value={form.evento_id} />

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white py-2 rounded ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? (
            <div className="flex justify-center items-center">
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                ></path>
              </svg>
              Registrando...
            </div>
          ) : (
            "Registrar"
          )}
        </button>
      </form>

      {mensaje && (
        <p
          className={`mt-4 text-center font-medium ${
            mensaje.startsWith("✅")
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {mensaje}
        </p>
      )}
    </div>
  );
}
