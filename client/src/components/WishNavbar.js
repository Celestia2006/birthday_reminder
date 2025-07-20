import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/WishNavbar.css";
import { useAuth } from "./AuthContext";

const WishNavbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();
  

  const handleSignIn = (e) => {
    e.preventDefault(); // Prevent default behavior
    navigate("/login", {
      state: {
        from: location.pathname,
        redirectToHome: true,
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
