import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AddBirthday.css";

const zodiacSigns = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

const AddBirthday = ({ addBirthday }) => {
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newBirthday = {
      name: formData.get("name"),
      date: formData.get("date"),
      nickname: formData.get("nickname"),
      photo: previewImage || "", // Use the preview image if available
      zodiac: formData.get("zodiac"),
      giftIdeas: formData.get("giftIdeas"),
      favoriteColor: formData.get("favoriteColor"),
      hobbies: formData.get("hobbies"),
      notes: formData.get("notes"),
      id: Date.now(), // Generate unique ID
      canonicalAge: calculateAge(formData.get("date")), // Calculate age
    };
    addBirthday(newBirthday);
    navigate("/");
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
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

  return (
    <div className="add-birthday-container">
      <div className="add-birthday-panel">
        <h2>Add New Birthday</h2>
        <form className="birthday-form" onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name*</label>
              <input type="text" id="name" name="name" required />
            </div>
            <div className="form-group">
              <label htmlFor="nickname">Nickname</label>
              <input type="text" id="nickname" name="nickname" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Birth Date*</label>
              <input type="date" id="date" name="date" required />
            </div>
            <div className="form-group">
              <label htmlFor="zodiac">Zodiac Sign</label>
              <select id="zodiac" name="zodiac">
                <option value="">Select...</option>
                {zodiacSigns.map((sign) => (
                  <option key={sign} value={sign}>
                    {sign}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Enhanced Photo Upload */}
          <div className="form-group">
            <label>Photo</label>
            <div className="image-upload-container">
              {previewImage && (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="image-preview"
                />
              )}
              <input
                type="file"
                id="photo"
                name="photo"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
              />
              <label htmlFor="photo" className="file-upload-button">
                {previewImage ? "Change Image" : "Select Image"}
              </label>
            </div>
          </div>

          {/* Personal Preferences */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="favoriteColor">Favorite Color</label>
              <input type="text" id="favoriteColor" name="favoriteColor" />
            </div>
            <div className="form-group">
              <label htmlFor="giftIdeas">Gift Ideas</label>
              <textarea
                type="text"
                id="giftIdeas"
                name="giftIdeas"
                rows="2"
                placeholder="e.g., Books, Chocolate"
              ></textarea>
            </div>
          </div>

          {/* Additional Info */}
          <div className="form-group">
            <label htmlFor="hobbies">Hobbies/Interests</label>
            <textarea id="hobbies" name="hobbies" rows="2"></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Special Notes</label>
            <textarea
              id="notes"
              name="notes"
              rows="2"
              placeholder="Allergies, preferences, etc."
            ></textarea>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/")}
            >
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Save Birthday
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBirthday;
