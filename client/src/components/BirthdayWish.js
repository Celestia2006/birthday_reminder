import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/BirthdayDetail.css";
import "../styles/WishNavbar.css";  // Changed to use BirthdayDetail.css
import WishNavbar from "./WishNavbar";

const BirthdayWish = ({ birthdays, isAdminView = false }) => {
  const { id } = useParams();
  const [isScheduled, setIsScheduled] = useState(false);
  const birthday = birthdays.find((b) => b.id === parseInt(id));
  const [error, setError] = useState(null);

  useEffect(() => {
    // Force logout when viewing wish
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");

    const fetchBirthday = async () => {
      try {
        const response = await axios.get(`/api/public/birthdays/${id}`);
        setBirthday(response.data.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load birthday");
      } finally {
        setLoading(false);
      }
    };

    fetchBirthday();
  }, [id]);

  if (!birthday) {
    return <div className="birthday-detail-container">Birthday not found</div>;
  }

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

  const handleScheduleMessage = async () => {
    try {
      const response = await axios.post("/api/send-whatsapp", {
        phone_number: birthday.phone_number,
        message: generateMessage(birthday),
        date: birthday.date,
      });
      if (response.data.success) {
        setIsScheduled(true);
      }
    } catch (error) {
      console.error("Failed to schedule message:", error);
    }
  };

  const generateMessage = (bday) => {
    return (
      `🎉 *Happy Birthday ${bday.name}!* 🎉\n\n` +
      `Check out your special birthday page:\n` +
      `${window.location.origin}/wish/${bday.id}\n\n` +
      `${bday.personalizedMessage || "Wishing you an amazing day!"}\n\n` +
      `From: Your Loved Ones`
    );
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

  if (loading) {
    return (
      <div className="app-wrapper">
        <WishNavbar />
        <div className="birthday-detail-container">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-wrapper">
        <WishNavbar />
        <div className="birthday-detail-container">{error}</div>
      </div>
    );
  }

  if (!birthday) {
    return (
      <div className="app-wrapper">
        <WishNavbar />
        <div className="birthday-detail-container">Birthday not found</div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <WishNavbar />
      <div className="birthday-detail-container">
        <div className="birthday-detail-card">
          {/* Name and Nickname at the very top */}
          <div className="detail-header">
            <h2>🎉 Happy Birthday, {birthday.name}! 🎉</h2>
            {birthday.nickname && (
              <p className="nickname">"{birthday.nickname}"</p>
            )}
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

            {birthday.personalizedMessage && (
              <div className="detail-section">
                <h3>💌 Special Message</h3>
                <p>{birthday.personalizedMessage}</p>
              </div>
            )}

            {birthday.favoriteColor && (
              <div className="detail-section">
                <h3>🎨 Favorite Color</h3>
                <p>{birthday.favoriteColor}</p>
              </div>
            )}

            {birthday.hobbies && (
              <div className="detail-section">
                <h3>⚡ Hobbies</h3>
                <p>{birthday.hobbies}</p>
              </div>
            )}
          </div>

          {/* Admin Controls (only shown in admin view) */}
          {isAdminView && (
            <div className="button-container">
              <button
                onClick={handleScheduleMessage}
                disabled={isScheduled}
                className="styled-button whatsapp-button"
              >
                {isScheduled ? "Message Scheduled!" : "Schedule WhatsApp Wish"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BirthdayWish;
