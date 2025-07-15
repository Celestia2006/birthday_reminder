import React from "react";
import { useAuth } from "./AuthContext";
import { AuthForm } from "./AuthForm";
import Header from "./Header";
import StarsBackground from "./StarsBackground";

const Signup = () => {
  const { register } = useAuth();
  const [error, setError] = React.useState("");

  const handleSignup = async (userData) => {
    try {
      await register(userData);
      // No need for additional login here - register already handles it
    } catch (err) {
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="app-wrapper">
      <StarsBackground />
      <Header />
      <AuthForm type="signup" onSubmit={handleSignup} error={error} />
    </div>
  );
};

export default Signup;
