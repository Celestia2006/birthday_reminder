import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/BirthdayDetail.css";

const calculateAge = (birthDate) => {
  if (!birthDate) return 0;
  const today = new Date();
  const birthDateObj = new Date(birthDate);
  if (isNaN(birthDateObj.getTime())) return 0;

  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
  ) {
    age--;
  }
  return age;
};

const BirthdayDetail = ({ birthdays, onDelete }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const birthday = birthdays.find((b) => b.id === parseInt(id));

  if (!birthday) {
    return <div className="birthday-detail-container">Birthday not found</div>;
  }

  const handleBack = () => navigate(-1);
  const handleEdit = () => navigate(`/edit-birthday/${birthday.id}`);
  const handleDelete = async () => {
    if (window.confirm(`Delete ${birthday.name}'s birthday?`)) {
      try {
        await onDelete(birthday.id);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  const calculateDaysUntilBirthday = () => {
    if (!birthday.date) return null;
    const today = new Date();
    const birthDate = new Date(birthday.date);
    let nextBirthday = new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    );
    if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);
    return Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
  };

  const daysUntilBirthday = calculateDaysUntilBirthday();
  const formattedPhone = birthday.phone_number?.replace(/^91/, ""); // Remove country code if present

  return (
    <div className="birthday-detail-container">
      <div className="birthday-detail-card">
        <div className="detail-header">
          <h2>{birthday.name}</h2>
          {birthday.nickname && <p className="nickname">{birthday.nickname}</p>}
        </div>

        <div className="detail-image-wrapper">
          <img
            src={birthday.photo || "/images/default.jpeg"}
            alt={birthday.name}
            className="detail-image"
            onError={(e) => (e.target.src = "/images/default.jpeg")}
          />
        </div>

        <div className="detail-content">
          {/* Birthday Info */}
          <div className="detail-section">
            <h3>🎉 Birthday</h3>
            <p>
              {new Date(birthday.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p>Turning {calculateAge(birthday.date) + 1}</p>
          </div>

          {/* Days Until Birthday */}
          {daysUntilBirthday !== null && (
            <div className="detail-section">
              <h3>⏳ Days Until Birthday</h3>
              <p>{daysUntilBirthday} days</p>
            </div>
          )}

          {/* Phone Number */}
          {formattedPhone && (
            <div className="detail-section">
              <h3>📱 Phone</h3>
              <p>{formattedPhone}</p>
            </div>
          )}

          {/* Zodiac */}
          {birthday.zodiac && (
            <div className="detail-section">
              <h3>♋ Zodiac</h3>
              <p>{birthday.zodiac}</p>
            </div>
          )}

          {/* Relationship */}
          {birthday.relationship && (
            <div className="detail-section">
              <h3>💞 Relationship</h3>
              <p>{birthday.relationship}</p>
            </div>
          )}

          {/* Favorite Color */}
          {birthday.favorite_color && (
            <div className="detail-section">
              <h3>🎨 Favorite Color</h3>
              <p>{birthday.favorite_color}</p>
            </div>
          )}

          {/* Hobbies */}
          {birthday.hobbies && (
            <div className="detail-section">
              <h3>⚡ Hobbies</h3>
              <p>{birthday.hobbies}</p>
            </div>
          )}

          {/* Gift Ideas */}
          {birthday.gift_ideas && (
            <div className="detail-section">
              <h3>🎁 Gift Ideas</h3>
              <p>{birthday.gift_ideas}</p>
            </div>
          )}

          {/* Personalized Message */}
          {birthday.personalized_message && (
            <div className="detail-section">
              <h3>💌 Message</h3>
              <p>{birthday.personalized_message}</p>
            </div>
          )}

          {/* Notes */}
          {birthday.notes && (
            <div className="detail-section">
              <h3>📝 Notes</h3>
              <p>{birthday.notes}</p>
            </div>
          )}
        </div>

        <div className="button-container">
          <button onClick={handleEdit} className="styled-button edit">
            Edit
          </button>
          <button onClick={handleBack} className="styled-button back">
            Back
          </button>
          <button
            onClick={handleDelete}
            className="styled-button delete-button"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default BirthdayDetail;
