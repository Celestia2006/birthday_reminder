const BirthdayCard = ({ birthday, onDelete }) => {
    const { id, name, date } = birthday;
    const formattedDate = new Date(date).toLocaleDateString('en-US', { 
      month: 'long', day: 'numeric' 
    });
  
    return (
      <div className="birthday-card">
        <span className="emoji">🎉</span>
        <div className="details">
          <h3>{name}</h3>
          <p>{formattedDate}</p>
        </div>
        <button onClick={() => onDelete(id)}>Delete</button>
      </div>
    );
  };
  
  export default BirthdayCard;