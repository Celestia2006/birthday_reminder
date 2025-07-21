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

  console.group("[Login] Component Mount");
  console.log("Current user:", user);
  console.log("Location state:", location.state);
  console.groupEnd();

  // Enhanced state extraction
  const navigationState = location.state || {};
  console.log("[Login] Full location:", location);

  const handleLogin = async (credentials) => {
    console.group("[Login] handleLogin Triggered");
    try {
      console.log("Attempting login with credentials:", credentials);
      await login(credentials);

      const loginResponse = await login(credentials);
      console.log("Login response:", loginResponse);

      const navigationState = location.state || {};
      console.log("Current navigation state:", navigationState);

      // Check both direct state and nested state
      const shouldRedirectHome =
        navigationState.redirectToHome ||
        (navigationState.state && navigationState.state.redirectToHome);
      console.log("Should redirect home:", shouldRedirectHome);
      console.log("Navigating to home page");
      navigate(shouldRedirectHome ? "/" : "/", {
        state: {
          fromLogin: true,
          previousState: navigationState,
        },
        replace: true,
      });
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    } finally {
      console.groupEnd();
    }
  };

  React.useEffect(() => {
    console.log("[Login] Auth state update - User:", user);
  }, [user]);

  return (
    <div className="app-wrapper">
      <StarsBackground />
      <Header />
      <AuthForm
        type="login"
        onSubmit={handleLogin}
        error={error}
        onMount={() => console.log("[AuthForm] Component mounted")}
      />
    </div>
  );
};

export default Login;