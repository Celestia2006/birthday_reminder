import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios"; // Add this import
import "../styles/BirthdayWish.css";

const BirthdayWish = ({ birthdays, isAdminView = false }) => {
  const { id } = useParams();
  const [isScheduled, setIsScheduled] = useState(false);
  const birthday = birthdays.find((b) => b.id === parseInt(id));

  if (!birthday) {
    return <div className="birthday-wish-container">Birthday not found</div>;
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
      `${bday.personalized_message || "Wishing you an amazing day!"}\n\n` +
      `From: Your Loved Ones`
    );
  };

  return (
    <div className="birthday-wish-container">
      {/* Celebratory View */}
      <div className="wish-header">
        <h1>🎉 Happy Birthday, {birthday.name}! 🎉</h1>
        {birthday.nickname && <h2>"{birthday.nickname}"</h2>}
      </div>

      <div className="wish-content">
        <div className="wish-section">
          <h3>About Your Special Day</h3>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(birthday.date).toLocaleDateString()}
          </p>
          <p>
            <strong>Turning:</strong> {calculateAge(birthday.date) + 1} years
            young!
          </p>
          {birthday.zodiac && (
            <p>
              <strong>Zodiac:</strong> {birthday.zodiac}
            </p>
          )}
        </div>

        {birthday.personalized_message && (
          <div className="wish-section personalized-message">
            <h3>A Special Message For You</h3>
            <p>{birthday.personalized_message}</p>
          </div>
        )}

        <div className="wish-fun-facts">
          {birthday.favoriteColor && (
            <div className="fun-fact">
              <span
                className="color-dot"
                style={{ backgroundColor: birthday.favoriteColor }}
              />
              <p>Favorite color: {birthday.favoriteColor}</p>
            </div>
          )}

          {birthday.hobbies && (
            <div className="fun-fact">
              <span>⚡</span>
              <p>Loves: {birthday.hobbies}</p>
            </div>
          )}
        </div>
      </div>

      {/* Admin Controls (only shown in admin view) */}
      {isAdminView && (
        <div className="admin-controls">
          <button
            onClick={handleScheduleMessage}
            disabled={isScheduled}
            className="whatsapp-button"
          >
            {isScheduled ? "Message Scheduled!" : "Schedule WhatsApp Wish"}
          </button>
          <p className="schedule-note">
            This will send a WhatsApp message on{" "}
            {new Date(birthday.date).toLocaleDateString()}
          </p>
        </div>
      )}

      <div className="wish-footer">
        <p>Wishing you an amazing day!</p>
      </div>
    </div>
  );
};

export default BirthdayWish;
