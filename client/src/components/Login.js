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
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  // Debug logs
  console.group("[Login] Component State");
  console.log("Current user:", user);
  console.log("Location state:", location.state);
  console.groupEnd();

  const handleLogin = async (credentials) => {
    console.group("[Login] Login Flow");
    setIsLoggingIn(true);

    try {
      console.log("Initiating login with:", credentials);
      const result = await login(credentials);
      console.log("AuthContext response:", result);

      // Wait briefly for state propagation
      await new Promise((resolve) => setTimeout(resolve, 50));

      const navigationState = location.state || {};
      console.log("Resolved navigation state:", navigationState);

      const shouldRedirectHome =
        navigationState.redirectToHome || navigationState.state?.redirectToHome;

      console.log(
        "Navigation decision:",
        shouldRedirectHome ? "Home" : "Default"
      );
      navigate(shouldRedirectHome ? "/" : "/", {
        state: {
          fromLogin: true,
          previousState: navigationState,
        },
        replace: true,
      });
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoggingIn(false);
      console.groupEnd();
    }
  };

  // Verify auth state updates
  React.useEffect(() => {
    if (user) {
      console.log("[Login] Detected user update - Proceeding to redirect");
      navigate(location.state?.from || "/", { replace: true });
    }
  }, [user, navigate, location.state]);

  return (
    <div className="app-wrapper">
      <StarsBackground />
      {showHeader && <Header />}
      <AuthForm
        type="login"
        onSubmit={(credentials) => {
          console.log("Form submitted - preventing default");
          handleLogin(credentials);
        }}
        error={error}
        disabled={isLoggingIn}
        onMount={() => console.log("[AuthForm] Ready")}
      />
    </div>
  );
};

export default Login;
