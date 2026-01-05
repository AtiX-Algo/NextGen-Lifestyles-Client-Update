import { createContext, useContext } from "react";

// Create Auth Context
export const AuthContext = createContext(null);

// ✅ Custom Hook
export const useAuth = () => {
  return useContext(AuthContext);
};
