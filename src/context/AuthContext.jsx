import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem("admin");
    return saved ? JSON.parse(saved) : null;
  });

  const navigate = useNavigate();

  const login = (user, pass) => {
    if (user === "admin" && pass === "123456") {
      const adminData = { user: "admin" };
      localStorage.setItem("admin", JSON.stringify(adminData));
      setAdmin(adminData);
      navigate("/dashboard");
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("admin");
    setAdmin(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
