import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Header from "./Header";
import StarsBackground from "./StarsBackground";
import { AuthForm } from "./AuthForm";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState("");
  const location = useLocation();
  const { redirectToHome } = location.state || {};

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      // Redirect to home if coming from wish page, otherwise to root
      navigate(redirectToHome ? "/" : "/", { state: { fromLogin: true } });
      console.log("Logged in");
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
