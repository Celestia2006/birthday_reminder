import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../styles/BirthdayDetail.css";

const formatPhoneNumber = (num) => {
  if (!num) return "";
  const str = num.toString().replace(/\D/g, "");

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

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff <= 0)) {
    age--;
  }

  return age;
};

const BirthdayDetail = ({ birthdays, onDelete }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  console.log("[Detail] Initial props:", { birthdays, id }); // Log 3
  console.log("[Detail] Location state:", location.state); // Log 4

  const [birthday, setBirthday] = useState(() => {
    const fromState = location.state?.updatedBirthday;
    const fromProps = birthdays.find((b) => b.id === parseInt(id));

    console.log("[Detail] Initial state - from state:", fromState); // Log 5
    console.log("[Detail] Initial state - from props:", fromProps); // Log 6

    return fromState || fromProps || null;
  });


  useEffect(() => {
    console.log("[Detail] Effect running"); // Log 7

    const fromState = location.state?.updatedBirthday;
    const fromProps = birthdays.find((b) => b.id === parseInt(id));

    if (fromState) {
      console.log("[Detail] Using state data"); // Log 8
      setBirthday(fromState);
    } else if (fromProps) {
      console.log("[Detail] Using props data"); // Log 9
      setBirthday(fromProps);
    } else {
      console.log("[Detail] No data found"); // Log 10
      setBirthday(null);
    }
  }, [birthdays, id, location.state]);

  useEffect(() => {
    if (birthday?.date && isNaN(new Date(birthday.date).getTime())) {
      console.error("Invalid date detected:", birthday.date);
      const found = birthdays.find((b) => b.id === parseInt(id));
      if (found) {
        setBirthday({ ...found });
      }
    }
  }, [birthday, birthdays, id]);

  if (!birthday) {
    return <div className="birthday-detail-container">Birthday not found</div>;
  }

  const handleWhatsAppWish = () => {
    if (!birthday.phone_number) {
      alert("No phone number available for this contact");
      return;
    }

    // Clean the phone number - remove all non-digit characters
    const cleanedNumber = birthday.phone_number.toString().replace(/\D/g, "");

    // Format for WhatsApp - add international prefix if not present
    let whatsappNumber;
    if (cleanedNumber.startsWith("91") && cleanedNumber.length === 12) {
      // Already has India country code
      whatsappNumber = cleanedNumber;
    } else if (cleanedNumber.length === 10) {
      // Assume it's an Indian number without country code
      whatsappNumber = `91${cleanedNumber}`;
    } else {
      // Use as-is for international numbers
      whatsappNumber = cleanedNumber;
    }

    const wishUrl = `${window.location.origin}/wish/${birthday.id}`;
    const message =
      `🎉 *Happy Birthday ${birthday.name}!* 🎉\n\n` +
      `Here's a special birthday wish for you:\n${wishUrl}\n\n` +
      `Wishing you a fantastic day filled with joy and happiness! 🥳`;
    
      const form = document.createElement("form");
      form.setAttribute("action", `https://wa.me/${whatsappNumber}`);
      form.setAttribute("method", "post");
      form.setAttribute("target", "_blank");
      form.style.display = "none";

      const messageInput = document.createElement("input");
      messageInput.setAttribute("type", "hidden");
      messageInput.setAttribute("name", "text");
      messageInput.setAttribute("value", message);

      form.appendChild(messageInput);
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
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
