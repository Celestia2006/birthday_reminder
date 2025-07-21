import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/BirthdayDetail.css";
import "../styles/WishNavbar.css";
import WishNavbar from "./WishNavbar";

const BirthdayWish = ({ birthdays }) => {
  const { id } = useParams();
  const [birthday, setBirthday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    console.groupCollapsed(`[BirthdayWish] Initializing for ID: ${id}`);
    console.log("Location state:", location.state);

    const state = location.state || {};
    const hasAuthFlag =
      state.fromLogin ||
      state._isWishNavigation ||
      (state.state && state.state.fromLogin);

    if (!hasAuthFlag) {
      console.log("[Auth] No auth flags found - clearing local storage");
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
    }

     const fetchBirthday = async () => {
       try {
         console.groupCollapsed(`[API] Fetching birthday ${id}`);
         const response = await axios.get(`/api/public/birthdays/${id}`);

         console.log("Full API Response:", response);
         console.log("Response Data:", response.data);

         if (!response.data?.data) {
           throw new Error("API response missing data field");
         }

         const data = response.data.data;
         console.log("Raw birth_date from API:", data.birth_date); // Changed from data.date

         // Handle both birth_date and date for backward compatibility
         const dateValue = data.birth_date || data.date; // Check both fields
         if (!dateValue) {
           throw new Error("No date field found in response");
         }

         let parsedDate = new Date(dateValue);
         if (isNaN(parsedDate.getTime())) {
           console.warn("Initial parse failed, trying alternative format");
           parsedDate = new Date(dateValue.replace(/-/g, "/"));
         }

         if (isNaN(parsedDate.getTime())) {
           throw new Error(`Invalid date: ${dateValue}`);
         }

         setBirthday({
           ...data,
           date: parsedDate.toISOString(), // Standardize to ISO format
         });
       } catch (err) {
         console.error("Fetch error:", err);
         setError(
           err.response?.data?.error || "Failed to load birthday details"
         );
       } finally {
         setLoading(false);
       }
     };

    fetchBirthday();
  }, [id, location]);

  const calculateAge = (birthDate) => {
    if (!birthDate) return 0;

    try {
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
    } catch (err) {
      console.error("Age calculation error:", err);
      return 0;
    }
  };

  const calculateDaysUntilBirthday = (birthDate) => {
    if (!birthDate) return null;

    try {
      const today = new Date();
      const currentYear = today.getFullYear();
      const birthDateObj = new Date(birthDate);

      if (isNaN(birthDateObj.getTime())) return null;

      const nextBirthday = new Date(
        currentYear,
        birthDateObj.getMonth(),
        birthDateObj.getDate()
      );

      if (nextBirthday < today) {
        nextBirthday.setFullYear(currentYear + 1);
      }

      const diffTime = nextBirthday - today;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (err) {
      console.error("Days calculation error:", err);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="birthday-detail-container">
        <WishNavbar />
        <div className="loading-message">Loading birthday details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="birthday-detail-container">
        <WishNavbar />
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!birthday) {
    return (
      <div className="birthday-detail-container">
        <WishNavbar />
        <div className="not-found-message">Birthday details not available</div>
      </div>
    );
  }

  const age = calculateAge(birthday.date);
  const daysUntilBirthday = calculateDaysUntilBirthday(birthday.date);

  return (
    <div className="birthday-detail-container">
      <div className="birthday-detail-card">
        <div className="detail-header">
          <h2>🎉 Happy Birthday, {birthday.name}! 🎉</h2>
          {birthday.nickname && (
            <p className="nickname">"{birthday.nickname}"</p>
          )}
        </div>

        <div className="detail-image-wrapper">
          <img
            src={birthday.photo || "/images/default.jpeg"}
            alt={birthday.name}
            className="detail-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/images/default.jpeg";
            }}
          />
        </div>

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
            <p>Turning {age + 1}</p>
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
      </div>
    </div>
  );
};

export default BirthdayWish;
