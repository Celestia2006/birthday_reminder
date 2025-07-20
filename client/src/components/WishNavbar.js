import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/WishNavbar.css";
import { useAuth } from "./AuthContext";

const WishNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleSignin = () => {
    console.log("[WishNavbar] Sign In button clicked");
    console.log("[WishNavbar] Current location state:", location.state);
    logout();
    navigate("/login", {
      state: {
        fromWish: true,
        redirectToHome: true,
        _isWishNavigation: true, // Additional flag
      },
      replace: true,
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
