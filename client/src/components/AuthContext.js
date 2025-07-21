import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext();

axios.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    config.headers["user-id"] = user.id;
  }
  return config;
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const initializeAuth = useCallback(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        return parsedUser;
      } catch (err) {
        console.error("Failed to parse user data:", err);
        localStorage.removeItem("user");
      }
    }
    return null;
  }, []);

  useEffect(() => {
    initializeAuth();
    setIsLoading(false);
  }, [initializeAuth]);

  const login = useCallback(async (credentials) => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/auth/login", credentials);

      const userData = {
        id: response.data.userId,
        username: response.data.username,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = async (userData) => {
    try {
      const response = await axios.post("/api/auth/register", userData);

      const newUser = {
        id: response.data.userId,
        username: response.data.username,
      };

      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
      return { success: true };
    } catch (err) {
      throw new Error(err.response?.data?.message || "Registration failed");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, initializeAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
