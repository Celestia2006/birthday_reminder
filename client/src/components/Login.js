import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import StarsBackground from "./StarsBackground";
import Header from "./Header";
import { AuthForm } from "./AuthForm";

const Login = ({ showHeader = false }) => {
  const { user } = useAuth();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState("");
  const location = useLocation();
  const { redirectToHome, fromWish, previousPath } = location.state || {};

  console.log("[Login] Rendering. Location state:", location.state);
  console.log("[Login] User status:", user);


  const handleLogin = async (credentials) => {
    try {
      console.log("[Login] Attempting login...");
      await login(credentials);
      console.log("[Login] Login successful. Redirecting...");
      console.log("[Login] redirectToHome:", redirectToHome);
      console.log("[Login] fromWish:", fromWish);
      if (redirectToHome) {
        console.log("[Login] Redirecting to home (/)");
        navigate("/", {
          state: { fromLogin: true },
          replace: true,
        });
      } else {
        console.log("[Login] No redirectToHome, navigating to /");
        navigate("/", {
          state: { fromLogin: true },
          replace: true,
        });
      }
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
