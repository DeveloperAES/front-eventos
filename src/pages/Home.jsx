import RegistroForm from "../components/RegistroForm";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-700">Boombtl Eventos</h1>
        <p className="text-gray-600 mt-2">
          Regístrate para participar en nuestros próximos eventos
        </p>
      </div>

      <RegistroForm />

      <footer className="mt-10 text-gray-500 text-sm">
        © {new Date().getFullYear()} Boombtl Eventos
      </footer>
    </div>
  );
}
