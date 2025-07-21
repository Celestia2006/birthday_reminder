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
  const { redirectToHome, fromWish } = location.state || {};

  // Debug logs
  React.useEffect(() => {
    console.group("[Login] Current State");
    console.log("User:", user);
    console.log("Location state:", location.state);
    console.groupEnd();
  }, [user, location.state]);

  const handleLogin = async (credentials) => {
    console.group("[Login] Login Process");
    setIsLoggingIn(true);

    try {
      console.log("Submitting credentials");
      const result = await login(credentials);

       await login(credentials);
       navigate(redirectToHome ? "/" : "/", {
         state: { fromLogin: true },
         replace: true,
       });

      const targetPath = location.state?.redirectToHome
        ? "/"
        : location.state?.from || "/";
      console.log("Navigating to:", targetPath);

      navigate(targetPath, {
        state: {
          fromLogin: true,
          previousState: location.state,
        },
        replace: true,
      });
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    } finally {
      setIsLoggingIn(false);
      console.groupEnd();
    }
  };

  return (
    <div className="app-wrapper">
      <StarsBackground />
      {showHeader && <Header />}
      <AuthForm
        type="login"
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin({
            username: e.target.username.value,
            password: e.target.password.value,
          });
        }}
        error={error}
        disabled={isLoggingIn}
      />
    </div>
  );
};

export default Login;
