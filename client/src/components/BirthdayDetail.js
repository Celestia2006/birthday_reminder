import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/BirthdayDetail.css";

const formatPhoneNumber = (num) => {
  if (!num) return "";
  const str = num.toString().replace(/\D/g, "");

  // Format with country code
  if (str.length === 10) return `+91 ${str.slice(0, 5)} ${str.slice(5)}`;
  if (str.length === 12 && str.startsWith("91")) {
    return `+${str.slice(0, 2)} ${str.slice(2, 7)} ${str.slice(7)}`;
  }
  return `+${str}`;
};

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

  console.log("--- BIRTHDAY DETAIL PROPS ---");
  console.log("All birthdays:", birthdays);
  console.log("Found birthday:", birthday);
  console.log("Phone number in component:", birthday?.phone_number);
  console.log("Type of phone number:", typeof birthday?.phone_number);

  if (!birthday) {
    return <div className="birthday-detail-container">Birthday not found</div>;
  }

  const handleWhatsAppWish = () => {
    if (!birthday.phone_number) {
      alert("Phone number is missing for this contact");
      return;
    }

    // Clean the phone number
    const cleanedPhone = birthday.phone_number.toString().replace(/\D/g, "");
    const whatsappNumber = cleanedPhone.startsWith("91")
      ? cleanedPhone
      : `91${cleanedPhone}`;

    // Create the birthday card URL
    const birthdayCardUrl = `${window.location.origin}/birthday/${birthday.id}`;

    const message =
      `🎉 *Happy Birthday ${birthday.name}!* 🎉\n\n` +
      `Wishing you a wonderful day filled with joy and happiness!\n\n` +
      `${
        birthday.personalized_message ||
        "You're amazing and we're so grateful to have you in our lives!"
      }\n\n` +
      `Check out your special birthday card here: ${birthdayCardUrl}\n\n` +
      `From: Your Friends & Family`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
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
              <p>{birthday.phone_number}</p>
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
