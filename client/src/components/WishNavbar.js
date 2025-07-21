import React from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import "../styles/WishNavbar.css";
import { useAuth } from "./AuthContext";

const WishNavbar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleSignin = () => {
    console.log("[WishNavbar] Sign In button clicked");
    logout();
    navigate("/login", {
      state: {
        fromWish: true, // Indicates coming from wish page
        redirectToHome: true, // New flag to redirect to home after login
        wishId: id, // Keep the wishId for reference if needed
      },
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
