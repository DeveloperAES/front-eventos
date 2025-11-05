import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { logout } = useAuth();



  

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4 text-xl font-semibold border-b">Panel BOOOM</div>
        <nav className="p-4 space-y-2">
          <Link to="/dashboard/usuarios" className="block hover:text-blue-600">
            Usuarios
          </Link>
          <Link to="/dashboard/validar" className="block hover:text-blue-600">
            Validar QR
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center p-4 bg-white shadow">
          <h1 className="text-lg font-semibold">Administración</h1>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
          >
            Cerrar sesión
          </button>
        </header>

        <main className="p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
