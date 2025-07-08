const UpcomingBirthdays = ({ birthdays }) => {
  const getDaysUntil = (dateStr) => {
    const today = new Date();
    const bday = new Date(dateStr);
    bday.setFullYear(today.getFullYear());
    const diff = bday - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="upcoming-list">
      <h3>Upcoming Birthdays</h3>
      {birthdays.length > 0 ? (
        <ul>
          {birthdays.map(bday => (
            <li key={bday.id}>
              <span className="name">{bday.name}</span>
              <span className="countdown">
                in {getDaysUntil(bday.date)} days
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-message">No upcoming birthdays in the next month</p>
      )}
    </div>
  );
};

export default UpcomingBirthdays;