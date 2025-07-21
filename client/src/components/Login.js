import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import StarsBackground from "./StarsBackground";
import Header from "./Header";
import { AuthForm } from "./AuthForm";

const Login = ({ showHeader = false }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState("");

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      // Always redirect to home after login
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="app-wrapper">
      <StarsBackground />
      <Header />
      <AuthForm type="login" onSubmit={handleLogin} error={error} />
    </div>
  );
};

export default Login;
