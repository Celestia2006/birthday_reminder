import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/WishNavbar.css"; 

const WishNavbar = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate("/login");
  };

  return (
    <nav className="wish-navbar">
      <div className="wish-navbar-container">
        <div className="wish-navbar-title">Birthday Wish</div>
        <div className="wish-navbar-signin">
          <button onClick={handleSignIn} className="signin-button">
            Sign In
          </button>
        </div>
      </div>
    </nav>
  );
};

export default WishNavbar;
