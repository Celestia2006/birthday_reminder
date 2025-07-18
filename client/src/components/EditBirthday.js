import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/AddBirthday.css"; // Using the same styles as AddBirthday

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

const relationships = [
  "Family",
  "Friend",
  "Colleague",
  "Partner",
  "Relative",
  "Other",
];

const formatDateForInput = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const EditBirthday = ({ birthdays, updateBirthday }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    date: "",
    phone_number: "",
    relationship: "Friend",
    zodiac: "",
    photo: "",
    personalizedMessage: "",
    favoriteColor: "",
    hobbies: "",
    giftIdeas: "",
    notes: "",
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be smaller than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        const compressedImage = canvas.toDataURL("image/jpeg", 0.7);
        setPreviewImage(compressedImage);
        setFormData((prev) => ({ ...prev, photo: compressedImage }));
      };
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const birthdayToEdit = birthdays.find((b) => b.id === parseInt(id));
    if (birthdayToEdit) {
      setFormData({
        name: birthdayToEdit.name,
        nickname: birthdayToEdit.nickname || "",
        date: formatDateForInput(birthdayToEdit.date),
        phone_number: birthdayToEdit.phone_number || "",
        relationship: birthdayToEdit.relationship || "Friend",
        zodiac: birthdayToEdit.zodiac || "",
        photo: birthdayToEdit.photo || "",
        personalizedMessage: birthdayToEdit.personalizedMessage || "",
        favoriteColor: birthdayToEdit.favoriteColor || "",
        hobbies: birthdayToEdit.hobbies || "",
        giftIdeas: birthdayToEdit.giftIdeas || "",
        notes: birthdayToEdit.notes || "",
      });
      if (birthdayToEdit.photo) {
        setPreviewImage(birthdayToEdit.photo);
      }
    }
  }, [id, birthdays]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const updatedData = {
        ...formData,
        phone_number: String(formData.phone_number).replace(/\D/g, ""),
        // Ensure date is in correct format for server
        date: new Date(formData.date).toISOString(),
      };

      const updatedBirthday = await updateBirthday(parseInt(id), updatedData);

      // Navigate with the updated data
      navigate(`/birthday/${id}`);//, {state: { updatedBirthday },});
    } catch (error) {
      setError(error.message || "Failed to update birthday");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-birthday-container">
      <div className="add-birthday-panel">
        <h2>Edit Birthday</h2>
        {error && <div className="error-message">{error}</div>}
        <form className="birthday-form" onSubmit={handleSubmit}>
          {/* Row 1: Name and Nickname */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name*</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="nickname">Nickname</label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 2: Birth Date and Phone Number */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Birth Date*</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone_number">Phone Number*</label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
                placeholder="e.g., 9876543210 or +919876543210"
              />
            </div>
          </div>

          {/* Row 3: Relationship and Zodiac */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="relationship">Relationship</label>
              <select
                id="relationship"
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
              >
                {relationships.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="zodiac">Zodiac Sign</label>
              <select
                id="zodiac"
                name="zodiac"
                value={formData.zodiac}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                {zodiacSigns.map((sign) => (
                  <option key={sign} value={sign}>
                    {sign}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="form-group">
            <label>Photo</label>
            <div className="image-upload-container">
              <input
                type="file"
                id="photo"
                name="photo"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
              />
              {previewImage && (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="image-preview"
                />
              )}
              <label htmlFor="photo" className="file-upload-button">
                {previewImage ? "Change Image" : "Select Image"}
              </label>
            </div>
          </div>

          {/* Personalized Message */}
          <div className="form-group">
            <label htmlFor="personalizedMessage">Personalized Message</label>
            <textarea
              id="personalizedMessage"
              name="personalizedMessage"
              rows="2"
              placeholder="A special birthday message..."
              value={formData.personalizedMessage}
              onChange={handleChange}
            ></textarea>
          </div>

          {/* Row 4: Favorite Color and Gift Ideas */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="favoriteColor">Favorite Color</label>
              <input
                type="text"
                id="favoriteColor"
                name="favoriteColor"
                value={formData.favoriteColor}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="giftIdeas">Gift Ideas</label>
              <textarea
                id="giftIdeas"
                name="giftIdeas"
                rows="2"
                placeholder="e.g., Books, Chocolate"
                value={formData.giftIdeas}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          {/* Hobbies */}
          <div className="form-group">
            <label htmlFor="hobbies">Hobbies/Interests</label>
            <textarea
              id="hobbies"
              name="hobbies"
              rows="2"
              value={formData.hobbies}
              onChange={handleChange}
            ></textarea>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label htmlFor="notes">Special Notes</label>
            <textarea
              id="notes"
              name="notes"
              rows="2"
              placeholder="Allergies, preferences, etc."
              value={formData.notes}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBirthday;
