const BirthdayCard = ({ birthday, isToday }) => {
  const { name, nickname, date, photo, hobbies } = birthday;
  const age = new Date().getFullYear() - new Date(date).getFullYear();
  
  return (
    <div className={`birthday-card ${isToday ? 'today' : ''}`}>
      {photo && <img src={photo} alt={name} className="profile-photo" />}
      <div className="card-content">
        <h2>{name}</h2>
        {nickname && <p className="nickname">"{nickname}"</p>}
        {isToday && <p className="age">{age} years old today!</p>}
        <p className="message">
          {isToday ? 'Happy Birthday! 🎂' : 'Coming soon!'}
        </p>
        
        {isToday && (
          <div className="card-actions">
            <button className="share-button">Share Celebration</button>
          </div>
        )}
        
        {hobbies && (
          <div className="hobbies">
            <small>Loves: {hobbies}</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default BirthdayCard;