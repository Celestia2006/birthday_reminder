import { useState, useRef } from "react";
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

const relationships = [
  "Family",
  "Friend",
  "Colleague",
  "Partner",
  "Relative",
  "Other",
];

const AddBirthday = ({ addBirthday, onSuccess }) => {
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Refs for form inputs
  const nameInput = useRef();
  const dateInput = useRef();
  const nicknameInput = useRef();
  const relationshipInput = useRef();
  const zodiacInput = useRef();
  const messageInput = useRef();
  const colorInput = useRef();
  const hobbiesInput = useRef();
  const giftsInput = useRef();
  const notesInput = useRef();
  const fileInput = useRef();
  const phoneNumberInput = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (2MB max)
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

        // Calculate new dimensions
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
        setPreviewImage(canvas.toDataURL("image/jpeg", 0.7));
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Basic validation
    if (
      !nameInput.current.value ||
      !dateInput.current.value ||
      !phoneNumberInput.current.value
    ) {
      setError("Name, birth date, and phone number are required!");
      setIsSubmitting(false);
      return;
    }

    // Create FormData
    const formData = new FormData();

    // Append all fields individually
    formData.append("name", nameInput.current.value);
    formData.append("birth_date", dateInput.current.value);
    formData.append("phone_number", phoneNumberInput.current.value);
    formData.append("nickname", nicknameInput.current?.value || "");
    formData.append(
      "relationship",
      relationshipInput.current.value || "Friend"
    );
    formData.append("zodiac", zodiacInput.current?.value || "");
    formData.append("personalized_message", messageInput.current?.value || "");
    formData.append("favorite_color", colorInput.current?.value || "");
    formData.append("hobbies", hobbiesInput.current?.value || "");
    formData.append("gift_ideas", giftsInput.current?.value || "");
    formData.append("notes", notesInput.current?.value || "");

    // Append file last
    if (fileInput.current?.files[0]) {
      formData.append("photo", fileInput.current.files[0]);
    }

    try {
      await addBirthday(formData);
      if (onSuccess) onSuccess();
    } catch (error) {
      setError(error.message || "Failed to save birthday");
    } finally {
      setIsSubmitting(false);
      navigate("/");
    }
  };

  return (
    <div className="add-birthday-container">
      <div className="add-birthday-panel">
        <h2>Add New Birthday</h2>
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
                required
                ref={nameInput}
              />
            </div>
            <div className="form-group">
              <label htmlFor="nickname">Nickname</label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                ref={nicknameInput}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number* (for notifications)</label>
              // In the phone number input field, update the pattern and add
              clearer validation
              <input
                type="tel"
                id="phone"
                name="phone_number"
                required
                ref={phoneNumberInput}
                placeholder="9876543210 or +919876543210"
                pattern="^(\+?\d{10,15})$"
                title="Enter 10 digits (e.g., 9876543210) or international format (e.g., +919876543210)"
              />
            </div>
          </div>

          {/* Row 2: Birth Date and Relationship */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Birth Date*</label>
              <input
                type="date"
                id="date"
                name="date"
                required
                ref={dateInput}
              />
            </div>
            <div className="form-group">
              <label htmlFor="relationship">Relationship</label>
              <select
                id="relationship"
                name="relationship"
                ref={relationshipInput}
              >
                {relationships.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Zodiac and Photo */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="zodiac">Zodiac Sign</label>
              <select id="zodiac" name="zodiac" ref={zodiacInput}>
                <option value="">Select...</option>
                {zodiacSigns.map((sign) => (
                  <option key={sign} value={sign}>
                    {sign}
                  </option>
                ))}
              </select>
            </div>
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
                  ref={fileInput}
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
          </div>

          {/* Personalized Message */}
          <div className="form-group">
            <label htmlFor="personalizedMessage">Personalized Message</label>
            <textarea
              id="personalizedMessage"
              name="personalizedMessage"
              rows="2"
              placeholder="A special birthday message..."
              ref={messageInput}
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
                ref={colorInput}
              />
            </div>
            <div className="form-group">
              <label htmlFor="giftIdeas">Gift Ideas</label>
              <textarea
                id="giftIdeas"
                name="giftIdeas"
                rows="2"
                placeholder="e.g., Books, Chocolate"
                ref={giftsInput}
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
              ref={hobbiesInput}
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
              ref={notesInput}
            ></textarea>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/")}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Birthday"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBirthday;
