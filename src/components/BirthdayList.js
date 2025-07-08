import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/App.css';

const BirthdayList = ({ birthdays }) => {
  return (
    <div className="app-container">
      <div className="panel right-panel">
        <h2>All Birthdays</h2>
        <div className="panel-content">
          {birthdays.length > 0 ? (
            <ul className="upcoming-list">
              {birthdays.map(person => (
                <li key={person.id} className="upcoming-item">
                  <Link 
                    to={`/birthday/${person.id}`} 
                    className="upcoming-link"
                  >
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
            <p>No birthdays found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BirthdayList;