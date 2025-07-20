import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/WishNavbar.css";
import { useAuth } from "./AuthContext";

const WishNavbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  

  const handleSignIn = () => {
    navigate("/login", {
      state: {
        from: location.pathname, // Current wish page path
        redirectToHome: true, // Flag to redirect to home after login
      },
    });
  };

  return (
    <header className="wish-navbar">
      <div className="wish-navbar-container">
        <div className="wish-navbar-title">Birthday Wish</div>
        <button
          onClick={handleSignIn}
          className="signin-button"
          aria-label="Sign in"
        >
          Sign In
        </button>
      </div>
    </header>
  );
};

export default WishNavbar;
