import React from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import StarsBackground from "./StarsBackground";
import Header from "./Header";
import { AuthForm } from "./AuthForm";

const Login = ({ showHeader = false }) => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); 
  const [error, setError] = React.useState("");

  const {
    fromWish = false,
    redirectToHome = true,
    wishId = id,
  } = location.state || {};

  // Enhanced state extraction
  const navigationState = location.state || {};
  console.log("[Login] Full location:", location);

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
        navigate("/", { replace: true }); // Default to home
      }
    catch (err) {
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