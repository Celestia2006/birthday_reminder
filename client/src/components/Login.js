import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Header from "./Header";
import StarsBackground from "./StarsBackground";
// In both Login.js and SignUp.js
import { AuthForm } from "./AuthForm";  // Changed from default import

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState("");
  const { redirectToHome } = location.state || {};

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      navigate("/", { state: { fromLogin: true } });
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="app-wrapper">
      <Header />
      <StarsBackground />
      <AuthForm type="login" onSubmit={handleLogin} error={error} />
    </div>
  );
};

export default Login;
