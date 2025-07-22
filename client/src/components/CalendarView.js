import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/CalendarView.css";

const CalendarView = ({ birthdays }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const getDateBirthdays = (date) => {
    return birthdays.filter((bday) => {
      const bdayDate = new Date(bday.date);
      return (
        bdayDate.getDate() === date.getDate() &&
        bdayDate.getMonth() === date.getMonth()
      );
    });
  };

  const handleDateClick = (value, event) => {
    event.stopPropagation();

    const dateBirthdays = getDateBirthdays(value);
    if (dateBirthdays.length > 0) {
      const tileRect = event.target.getBoundingClientRect();
      setPopupPosition({
        x: tileRect.left + window.scrollX + tileRect.width / 2,
        y: tileRect.top + window.scrollY - 10,
      });
      setSelectedDate({
        date: value,
        birthdays: dateBirthdays,
      });
    } else {
      setSelectedDate(null);
    }
  };

  const closePopup = (e) => {
    if (e && e.target.closest(".birthday-popup")) {
      return;
    }
    setSelectedDate(null);
  };

  return (
    <div className="calendar-container" onClick={closePopup}>
      <Calendar
        tileContent={({ date, view }) => {
          if (view !== "month") return null;
          const dateBirthdays = getDateBirthdays(date);
          return dateBirthdays.length > 0 ? (
            <div className="cake-emoji">🎂</div>
          ) : null;
        }}
        tileClassName={({ date, view }) => {
          if (view !== "month") return null;
          const dateBirthdays = getDateBirthdays(date);
          return dateBirthdays.length > 0 ? "has-birthday" : "";
        }}
        onClickDay={handleDateClick}
        className="custom-calendar"
      />

      {selectedDate && (
        <div
          className="birthday-popup"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
            transform: "translateX(-50%)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="close-popup" onClick={closePopup}>
            ×
          </button>
          {selectedDate.birthdays.map((bday) => (
            <div key={bday.id} className="birthday-popup-item">
              <img
                src={bday.photo}
                alt={bday.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/default.jpg";
                }}
              />
              <span>{bday.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarView;
