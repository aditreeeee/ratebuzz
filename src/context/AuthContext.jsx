import React, { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

const VALID_USERNAME = "admin@ratebuzz.com";
const VALID_PASSWORD = "Admin@123";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = useCallback((username, password) => {
    if (username.trim() === VALID_USERNAME && password === VALID_PASSWORD) {
      setUser({ username });
      return { ok: true };
    }
    return { ok: false, error: "Invalid username or password." };
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
