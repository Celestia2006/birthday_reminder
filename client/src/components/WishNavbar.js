import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/WishNavbar.css";
import { useAuth } from "./AuthContext";

const WishNavbar = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the wish ID from URL params
  const { logout } = useAuth();

  const handleSignIn = () => {
    // First logout if user is logged in
    logout();

    // Then navigate to login with wish context
    navigate("/login", {
      state: {
        fromWish: true,
        wishId: id,
      },
      replace: true,
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
