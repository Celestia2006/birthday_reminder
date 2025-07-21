import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import StarsBackground from "./StarsBackground";
import Header from "./Header";
import { AuthForm } from "./AuthForm";

const Login = ({ showHeader = false }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = React.useState("");

  // Get navigation state with defaults
  const { fromWish = false, wishId = null } = location.state || {};

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);

      // Determine where to redirect after login
      if (fromWish && wishId) {
        // If coming from wish page, go back to that specific wish
        navigate(`/wish/${wishId}`, {
          state: { fromLogin: true },
          replace: true,
        });
      } else {
        // Default to home page
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
      {showHeader && <Header />}
      <AuthForm type="login" onSubmit={handleLogin} error={error} />
    </div>
  );
};

export default Login;
