// client/src/api/api.js
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";
export const getBirthdays = async () => {
  const response = await axios.get(`${API_BASE_URL}/birthdays`);
  return response.data.map((item) => ({
    id: item.id,
    name: item.name,
    nickname: item.nickname,
    date: item.birth_date, // Transform birth_date to date
    zodiac: item.zodiac,
    photo: item.photo_url
      ? `${process.env.PUBLIC_URL}${item.photo_url}`
      : "/images/default.jpeg",
    giftIdeas: item.gift_ideas,
    hobbies: item.hobbies,
    favoriteColor: item.favorite_color,
    notes: item.notes,
    relationship: item.relationship,
    personalizedMessage: item.personalized_message,
    canonicalAge: item.age,
  }));
};

// Similarly update other methods (add, update, delete)
export const addBirthday = (birthday) =>
  axios.post(`${API_BASE_URL}/birthdays`, {
    name: birthday.name,
    nickname: birthday.nickname,
    birth_date: birthday.date, // Transform back for backend
    zodiac: birthday.zodiac,
    photo_url: birthday.photo,
    gift_ideas: birthday.giftIdeas,
    hobbies: birthday.hobbies,
    favorite_color: birthday.favoriteColor,
    notes: birthday.notes,
    relationship: birthday.relationship,
    personalized_message: birthday.personalizedMessage,
  });
