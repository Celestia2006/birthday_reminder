import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/WishNavbar.css";
import { useAuth } from "./AuthContext";

const WishNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleSignin = () => {
    const navigationState = {
    fromWish: true,
    redirectToHome: true,
    timestamp: Date.now(), // For debugging
    previousPath: location.pathname
  };
  
  console.log('[WishNavbar] Navigation state:', navigationState);
  
  navigate("/login", {
    state: navigationState,
    replace: true
  });
};

  return (
    <header className="wish-navbar">
      <div className="wish-navbar-container">
        <div className="wish-navbar-title">Birthday Wish</div>
        <button
          onClick={handleSignin}
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
