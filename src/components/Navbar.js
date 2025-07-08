import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <ul className="navbar-menu">
        <li className="navbar-item">
          <Link to="/" className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
        </li>
        <li className="navbar-item">
          <Link 
            to="/all-birthdays" 
            className={`navbar-link ${location.pathname === '/all-birthdays' ? 'active' : ''}`}
          >
            All Birthdays
          </Link>
        </li>
        <li className="navbar-item">
          <Link 
            to="/calendar" 
            className={`navbar-link ${location.pathname === '/calendar' ? 'active' : ''}`}
          >
            Calendar
          </Link>
        </li>
        <li className="navbar-item">
          <Link 
            to="/add-birthday" 
            className={`navbar-link add-birthday-btn ${location.pathname === '/add-birthday' ? 'active' : ''}`}
          >
            Add Birthday
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;