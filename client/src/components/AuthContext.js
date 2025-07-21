// src/components/AuthContext.js
import { createContext, useContext, useState } from "react";
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
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const navigate = useNavigate();

  const login = async (credentials) => {
    try {
      const response = await axios.post("/api/auth/login", credentials);
      const userData = {
        id: response.data.userId,
        username: response.data.username,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData); // THIS MUST UPDATE THE CONTEXT

      return {
        success: true,
        user: userData, // MUST RETURN USER DATA
      };
    } catch (err) {
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post("/api/auth/register", userData);

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: response.data.userId,
          username: response.data.username,
        })
      );

      if (response.data.success) {
        setUser({
          id: response.data.userId,
          username: response.data.username,
        });
        navigate("/");
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (err) {
      throw new Error(err.response?.data?.message || "Registration failed");
    }
  };

  const logout = () => {
    setUser(null);
    navigate("/login");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
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
