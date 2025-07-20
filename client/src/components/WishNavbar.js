import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/WishNavbar.css";

const WishNavbar = () => {
  const navigate = useNavigate();

  const handleSignIn = (e) => {
    e.preventDefault(); // Prevent default behavior
    console.log("Sign in clicked"); // For debugging
    navigate("/login", { replace: true }); // Added replace option
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
