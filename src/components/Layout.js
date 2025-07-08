import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = ({ todaysBirthdays, upcomingBirthdays }) => {
  return (
    <div className="app-container">
      {/* Left Panel - Today's Birthdays */}
      <div className="panel left-panel">
        <h2>Today's Birthdays</h2>
        <div className="panel-content">
          {todaysBirthdays.length > 0 ? (
            todaysBirthdays.map(person => (
              <div key={person.id} className="birthday-card">
                <img 
                  src={person.photo || "/images/default.jpg"} 
                  alt={person.name}
                  className="birthday-image"
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = "/images/default.jpg";
                  }}
                />
                <h3>{person.message}</h3>
                <p className="age-message">Turning {person.canonicalAge} today!</p>
                <div className="birthday-details">
                  <p><strong>Nickname:</strong> {person.nickname}</p>
                  <p><strong>Zodiac:</strong> {person.zodiac}</p>
                  <p><strong>Gift Ideas:</strong> {person.giftIdeas}</p>
                </div>
                <Link 
                  to={`/birthday/${person.id}`} 
                  className="styled-button view-details-button"
                >
                  View Full Details
                </Link>
              </div>
            ))
          ) : (
            <p>No birthdays today</p>
          )}
        </div>
      </div>

      {/* Right Panel - Upcoming Birthdays */}
      <div className="panel right-panel">
        <h2>Upcoming Birthdays</h2>
        <div className="panel-content">
          {upcomingBirthdays.length > 0 ? (
            <ul className="upcoming-list">
              {upcomingBirthdays.map(person => (
                <li key={person.id} className="upcoming-item">
  <Link to={`/birthday/${person.id}`} className="upcoming-link">
    <div className="upcoming-image-container">
      <img 
        src={person.photo || "/images/default.jpg"} 
        alt={person.name}
        onError={(e) => {
          e.target.onerror = null; 
          e.target.src = "/images/default.jpg";
        }}
      />
    </div>
    <div className="upcoming-details">
      <h3 className="person-name">{person.name}</h3>
      <p>{new Date(person.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })}</p>
      <p className="nickname">{person.nickname}</p>
    </div>
  </Link>
</li>
              ))}
            </ul>
          ) : (
            <p>No upcoming birthdays</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Layout;