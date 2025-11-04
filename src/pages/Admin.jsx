import { useState, useEffect } from "react";
import LoginAdmin from "../components/LoginAdmin";
import AdminPanel from "../components/AdminPanel";

export default function Admin() {
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("adminAuth") === "true") setAuth(true);
  }, []);

  return auth ? <AdminPanel /> : <LoginAdmin onLogin={setAuth} />;
}
