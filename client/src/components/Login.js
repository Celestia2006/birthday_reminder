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
  const {
    fromWish = false,
    redirectToHome = false,
    previousPath = null,
  } = location.state || {};

  console.log("[Login] Location state:", location.state);
  console.log(
    "[Login] Parsed values - fromWish:",
    fromWish,
    "redirectToHome:",
    redirectToHome
  );


  const handleLogin = async (credentials) => {
    try {
      const success = await login(credentials);
      if (success) {
        const { fromWish = false, redirectToHome = false } =
          location.state || {};
        console.log(
          "[Login] Post-login navigation - fromWish:",
          fromWish,
          "redirectToHome:",
          redirectToHome
        );

        if (fromWish || redirectToHome) {
          console.log("[Login] Redirecting to home page");
          navigate("/", {
            state: { fromLogin: true },
            replace: true,
          });
        } else {
          console.log("[Login] Standard redirect to home");
          navigate("/", {
            state: { fromLogin: true },
            replace: true,
          });
        }
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
