import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import StarsBackground from "./StarsBackground";
import Header from "./Header";
import { AuthForm } from "./AuthForm";

const Login = ({ showHeader = false }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState("");
  const location = useLocation();
  const { redirectToHome, fromWish } = location.state || {};

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      navigate(redirectToHome ? "/" : "/", {
        state: { fromLogin: true },
        replace: true,
      });
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="app-wrapper">
      <StarsBackground />
      {showHeader && <Header />}
      <AuthForm type="login" onSubmit={handleLogin} error={error} />
    </div>
  );
};

export default Login;
