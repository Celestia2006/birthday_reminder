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
  const dayDiff = today.getDate() - birthDateObj.getDate();

  // If birthday hasn't occurred yet this year OR is today
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff <= 0)) {
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

  const handleWhatsAppWish = () => {
    if (!birthday.phone_number) {
      alert("Phone number is missing for this contact");
      return;
    }

    // Clean the phone number (remove all non-digit characters)
    let cleanedPhone = birthday.phone_number.toString().replace(/\D/g, "");

    // Add country code if missing (assuming 10 digits means India)
    if (cleanedPhone.length === 10) {
      cleanedPhone = `91${cleanedPhone}`;
    }

    const message =
      `🎉 *Happy Birthday ${birthday.name}!* 🎉\n\n` +
      `Wishing you a wonderful day!\n\n` +
      `${
        birthday.personalized_message ||
        "May your year be filled with happiness!"
      }\n\n` +
      `From: Your Friend`;

    const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank");
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    navigate(`/edit-birthday/${birthday.id}`);
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${birthday.name}'s birthday?`
      )
    ) {
      try {
        await onDelete(birthday.id);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  // Calculate days until birthday
  const calculateDaysUntilBirthday = () => {
    if (!birthday.date) return null;

    const today = new Date();
    const currentYear = today.getFullYear();
    const birthDate = new Date(birthday.date);
    const nextBirthday = new Date(
      currentYear,
      birthDate.getMonth(),
      birthDate.getDate()
    );

    if (nextBirthday < today) {
      nextBirthday.setFullYear(currentYear + 1);
    }

    const diffTime = nextBirthday - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysUntilBirthday = calculateDaysUntilBirthday();

  return (
    <div className="birthday-detail-container">
      <div className="birthday-detail-card">
        {/* Name and Nickname at the very top */}
        <div className="detail-header">
          <h2>{birthday.name}</h2>
          {birthday.nickname && <p className="nickname">{birthday.nickname}</p>}
        </div>

        {/* Oval Image centered below the header */}
        <div className="detail-image-wrapper">
          <img
            src={birthday.photo}
            alt={birthday.name}
            className="detail-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/images/default.jpeg";
            }}
          />
        </div>

        {/* All details in a single vertical column */}
        <div className="detail-content">
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

          {daysUntilBirthday !== null && (
            <div className="detail-section">
              <h3>⏳ Days Until Birthday</h3>
              <p>{daysUntilBirthday} days</p>
            </div>
          )}

          {birthday.zodiac && (
            <div className="detail-section">
              <h3>♋ Zodiac</h3>
              <p>{birthday.zodiac}</p>
            </div>
          )}

          {birthday.relationship && (
            <div className="detail-section">
              <h3>💞 Relationship</h3>
              <p>{birthday.relationship}</p>
            </div>
          )}

          {birthday.relationship && (
            <div className="detail-section">
              <h3>📞 Contact</h3>
              <p>+{birthday.phone_number.toString().replace(/^91/, "")}</p>
            </div>
          )}

          {birthday.giftIdeas && (
            <div className="detail-section">
              <h3>🎁 Gift Ideas</h3>
              <p>{birthday.giftIdeas}</p>
            </div>
          )}

          {birthday.hobbies && (
            <div className="detail-section">
              <h3>⚡ Hobbies</h3>
              <p>{birthday.hobbies}</p>
            </div>
          )}

          {birthday.favoriteColor && (
            <div className="detail-section">
              <h3>🎨 Favorite Color</h3>
              <p>{birthday.favoriteColor}</p>
            </div>
          )}

          {birthday.personalizedMessage && (
            <div className="detail-section">
              <h3>💌 Personalized Message</h3>
              <p>{birthday.personalizedMessage}</p>
            </div>
          )}

          {birthday.notes && (
            <div className="detail-section">
              <h3>📝 Notes</h3>
              <p>{birthday.notes}</p>
            </div>
          )}
          {/* Add this debug section */}
          <div className="debug-section">
            <h3>Debug Info</h3>
            <pre>{JSON.stringify(birthday, null, 2)}</pre>
          </div>
          <div className="notes-gap"></div>
        </div>

        {/* Buttons at the very bottom */}
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
          <button
            onClick={handleWhatsAppWish}
            className="styled-button whatsapp-button"
          >
            Wish them now!
          </button>
        </div>
      </div>
    </div>
  );
};

export default BirthdayDetail;
