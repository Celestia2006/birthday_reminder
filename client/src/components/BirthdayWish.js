import React, { useState, useEffect } from "react";
import WhatsAppService from "../services/WhatsAppService";

const BirthdayWish = ({ birthday }) => {
  const [isScheduled, setIsScheduled] = useState(false);
  const whatsappService = new WhatsAppService();

  useEffect(() => {
    return () => {
      // Clean up when component unmounts
      whatsappService.client.destroy();
    };
  }, []);

  const handleScheduleMessage = () => {
    const message = generateMessage(birthday);
    whatsappService.scheduleBirthdayMessage(
      birthday.phone_number,
      message,
      birthday.date
    );
    setIsScheduled(true);
  };

  const generateMessage = (bday) => {
    return `🎉 *Happy Birthday ${bday.name}!* 🎉
    
Age: ${calculateAge(bday.date) + 1}
Relationship: ${bday.relationship}
    
${bday.personalized_message || "Wishing you a wonderful day!"}
    
From: Your Birthday Reminder App`;
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

  return (
    <div className="birthday-wish-container">
      <h2>Birthday Wish for {birthday.name}</h2>
      <div className="wish-preview">
        <p>{generateMessage(birthday)}</p>
      </div>
      <button
        onClick={handleScheduleMessage}
        disabled={isScheduled}
        className="whatsapp-button"
      >
        {isScheduled ? "Message Scheduled!" : "Schedule WhatsApp Message"}
      </button>
    </div>
  );
};

export default BirthdayWish;
