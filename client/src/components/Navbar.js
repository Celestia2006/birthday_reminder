import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link
              to="/"
              className={`navbar-link ${
                location.pathname === "/" ? "active" : ""
              }`}
            >
              Home
            </Link>
          </li>
          <li className="navbar-item">
            <Link
              to="/all-birthdays"
              className={`navbar-link ${
                location.pathname === "/all-birthdays" ? "active" : ""
              }`}
            >
              All Birthdays
            </Link>
          </li>
          <li className="navbar-item">
            <Link
              to="/calendar"
              className={`navbar-link ${
                location.pathname === "/calendar" ? "active" : ""
              }`}
            >
              Calendar
            </Link>
          </li>
          <li className="navbar-item">
            <Link
              to="/add-birthday"
              className={`navbar-link add-birthday-btn ${
                location.pathname === "/add-birthday" ? "active" : ""
              }`}
            >
              Add Birthday
            </Link>
          </li>
        </ul>

        <div className="navbar-logout">
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
