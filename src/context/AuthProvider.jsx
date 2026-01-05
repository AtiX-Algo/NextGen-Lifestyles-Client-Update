import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  // -----------------------------
  // State: User
  // -----------------------------
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // -----------------------------
  // Sync user to localStorage
  // -----------------------------
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, [user]);

  // -----------------------------
  // Login
  // -----------------------------
  const login = (userData, token) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  // -----------------------------
  // Logout
  // -----------------------------
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // -----------------------------
  // Update user role in real-time
  // -----------------------------
  const updateUserRole = (newRole) => {
    setUser((prev) => ({ ...prev, role: newRole }));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};
