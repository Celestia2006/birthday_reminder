import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ZODIAC_SIGNS = [
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

const EditBirthday = ({ birthdays, updateBirthday }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    date: "",
    photo: "",
    zodiac: "",
    giftIdeas: "",
    hobbies: "",
    favoriteColor: "",
    notes: "",
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData((prev) => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Pre-fill form with existing data
  useEffect(() => {
    const birthdayToEdit = birthdays.find((b) => b.id === parseInt(id));
    if (birthdayToEdit) {
      setFormData({
        ...birthdayToEdit,
        date: birthdayToEdit.date.split("T")[0],
      });
      // Add this line to set the preview image if it exists
      if (birthdayToEdit.photo) {
        setPreviewImage(birthdayToEdit.photo);
      }
    }
  }, [id, birthdays]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateBirthday(parseInt(id), formData);
    navigate(`/birthday/${id}`);
  };

  return (
    <div className="edit-birthday-container">
      <div className="edit-birthday-panel">
        <h2>Edit Birthday</h2>
        <form onSubmit={handleSubmit} className="birthday-form">
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Nickname:</label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Birth Date:</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Photo:</label>
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
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="file-upload-button">
                {previewImage ? "Change Image" : "Select Image"}
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Zodiac Sign:</label>
            <select
              name="zodiac"
              value={formData.zodiac}
              onChange={handleChange}
              className="zodiac-select"
            >
              <option value="">Select Zodiac Sign</option>
              {ZODIAC_SIGNS.map((sign) => (
                <option key={sign} value={sign}>
                  {sign}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Gift Ideas:</label>
            <textarea
              name="giftIdeas"
              value={formData.giftIdeas}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Hobbies:</label>
            <textarea
              name="hobbies"
              value={formData.hobbies}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Favorite Color:</label>
            <input
              type="text"
              name="favoriteColor"
              value={formData.favoriteColor}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Notes:</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="cancel-button"
            >
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBirthday;
