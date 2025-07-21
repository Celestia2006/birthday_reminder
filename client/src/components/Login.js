import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import StarsBackground from "./StarsBackground";
import Header from "./Header";
import { AuthForm } from "./AuthForm";

const Login = ({ showHeader = false }) => {
  const { login, initializeAuth } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState("");
  const location = useLocation();
  const { fromWish = false, wishId = null } = location.state || {};

  const navigationState = location.state || {};
  console.log("[Login] Full navigation state:", navigationState);

  const handleLogin = async (credentials) => {
    try {
      const user = await login(credentials);
      if (user) {
        // Force a state refresh
        await initializeAuth();
        const shouldRedirectHome =
          navigationState.redirectToHome || navigationState._isWishNavigation;

        console.log("[Login] Redirecting to:", shouldRedirectHome ? "/" : "/");
        navigate(shouldRedirectHome ? "/" : "/", {
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
      {showHeader && <Header />}
      <AuthForm type="login" onSubmit={handleLogin} error={error} />
    </div>
  );
};

export default Login;
