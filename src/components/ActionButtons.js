import React from 'react';
import { useNavigate } from 'react-router-dom';

const ActionButtons = () => {
  const navigate = useNavigate();

  return (
    <div className="action-buttons">
      <button 
        onClick={() => navigate('/add-birthday')}
        className="styled-button"
      >
        Add Birthday
      </button>
      <button 
        onClick={() => navigate('/calendar')}
        className="styled-button"
      >
        View Calendar
      </button>
      <button 
        onClick={() => navigate('/all-birthdays')}
        className="styled-button"
      >
        View All
      </button>
    </div>
  );
};

export default ActionButtons;