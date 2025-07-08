import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/BirthdayDetail.css'; // Updated import path

const BirthdayDetail = ({ birthdays, setBirthdays }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const birthday = birthdays.find(b => b.id === parseInt(id));

  if (!birthday) {
    return <div className="birthday-detail-container">Birthday not found</div>;
  }

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
        // 1. Filter out the deleted birthday
        const updatedBirthdays = birthdays.filter((b) => b.id !== parseInt(id));

        // 2. Update state first
        setBirthdays(updatedBirthdays);

        // 3. Then update localStorage
        localStorage.setItem("birthdays", JSON.stringify(updatedBirthdays));

        // 4. Navigate back (no need to wait)
        navigate("/");
      } catch (error) {
        console.error("Error deleting birthday:", error);
      }
    }
  };

  return (
    <div className="birthday-detail-container">
      <div className="birthday-detail-card">
        <img
          src={birthday.photo}
          alt={birthday.name}
          className="detail-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/images/default.jpg";
          }}
        />

        <div className="detail-content">
          <h2>{birthday.name}</h2>
          <p className="nickname">{birthday.nickname}</p>

          <div className="detail-section">
            <h3>🎉 Birthday</h3>
            <p>
              {new Date(birthday.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p>Turning {birthday.canonicalAge}</p>
          </div>

          <div className="detail-section">
            <h3>♋ Zodiac</h3>
            <p>{birthday.zodiac}</p>
          </div>

          <div className="detail-section">
            <h3>🎁 Gift Ideas</h3>
            <p>{birthday.giftIdeas}</p>
          </div>

          <div className="detail-section">
            <h3>⚡ Hobbies</h3>
            <p>{birthday.hobbies}</p>
          </div>

          <div className="detail-section">
            <h3>Favorite Color</h3>
            <p>{birthday.favoriteColor}</p>
          </div>

          <div className="detail-section">
            <h3>📝 Notes</h3>
            <p>{birthday.notes}</p>
          </div>
        </div>
      </div>
      <div className="button-container">
        <button onClick={handleEdit} className="styled-button edit">
          Edit
        </button>
        <button onClick={handleBack} className="styled-button back">
          Back
        </button>
        <button onClick={handleDelete} className="styled-button delete-button">
          Delete
        </button>
      </div>
    </div>
  );
};

export default BirthdayDetail;