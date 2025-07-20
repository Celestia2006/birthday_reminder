import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/WishNavbar.css";

const WishNavbar = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate("/login");
  };

  return (
    <header className="wish-navbar">
      <div className="wish-navbar-container">
        <div className="wish-navbar-title">Birthday Wish</div>
        <button onClick={handleSignIn} className="signin-button">
          Sign In
        </button>
      </div>
    </header>
  );
};

export default WishNavbar;
