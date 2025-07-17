import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export const getBirthdays = async (userId) => {
  const response = await axios.get(`${API_BASE_URL}/birthdays`, {
    headers: {
      "user-id": userId,
    },
  });
  return response.data.map((item) => ({
    id: item.id,
    name: item.name,
    nickname: item.nickname,
    date: item.birth_date,
    zodiac: item.zodiac,
    photo: item.photo_url || "/images/default.jpeg",
    giftIdeas: item.gift_ideas,
    hobbies: item.hobbies,
    favoriteColor: item.favorite_color,
    notes: item.notes,
    relationship: item.relationship,
    personalizedMessage: item.personalized_message,
  }));
};

export const addBirthday = async (formData, userId) => {
  const response = await axios.post(`${API_BASE_URL}/birthdays`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "user-id": userId,
    },
  });
  return response.data;
};
