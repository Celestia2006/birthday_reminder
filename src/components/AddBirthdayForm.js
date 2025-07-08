import { useState } from 'react';

const AddBirthdayForm = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    nickname: '',
    photo: '',
    hobbies: '',
    giftIdeas: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.date) return alert('Name and date are required!');
    
    onAdd({
      ...formData,
      id: Date.now()
    });
  };

  return (
    <div className="birthday-form">
      <button className="close-button" onClick={onClose}>×</button>
      <h3>Add New Birthday</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name*</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Birth Date*</label>
          <input 
            type="date" 
            name="date" 
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Nickname</label>
          <input 
            type="text" 
            name="nickname" 
            value={formData.nickname}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label>Photo URL</label>
          <input 
            type="url" 
            name="photo" 
            value={formData.photo}
            onChange={handleChange}
            placeholder="https://example.com/photo.jpg"
          />
        </div>
        
        <div className="form-group">
          <label>Hobbies/Interests</label>
          <input 
            type="text" 
            name="hobbies" 
            value={formData.hobbies}
            onChange={handleChange}
            placeholder="e.g., Reading, Sports"
          />
        </div>
        
        <div className="form-group">
          <label>Gift Ideas</label>
          <textarea 
            name="giftIdeas" 
            value={formData.giftIdeas}
            onChange={handleChange}
            placeholder="What would they love to receive?"
          />
        </div>
        
        <button type="submit" className="submit-button">Save Birthday</button>
      </form>
    </div>
  );
};

export default AddBirthdayForm;