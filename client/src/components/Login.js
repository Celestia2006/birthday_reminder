import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import StarsBackground from "./StarsBackground";
import Header from "./Header";
import { AuthForm } from "./AuthForm";

const Login = ({ showHeader = false }) => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = React.useState("");

  // Enhanced state extraction
  const navigationState = location.state || {};
  console.log("[Login] Full location:", location);

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);

      // Check both direct state and nested state
      const shouldRedirectHome =
        navigationState.redirectToHome ||
        (navigationState.state && navigationState.state.redirectToHome);

      console.log(
        "[Login] Redirecting to home. Should redirect:",
        shouldRedirectHome
      );
      navigate("/", {
        state: {
          fromLogin: true,
          previousState: navigationState, // Preserve original state
        },
        replace: true,
        showHeader: true,
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