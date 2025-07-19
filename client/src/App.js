import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import AddBirthday from "./components/AddBirthday";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import BirthdayList from "./components/BirthdayList";
import CalendarView from "./components/CalendarView";
import "./styles/App.css";
import "./styles/EditBirthday.css";
import BirthdayWish from "./components/BirthdayWish";
import BirthdayDetail from "./components/BirthdayDetail";
import EditBirthday from "./components/EditBirthday";
import StarsBackground from "./components/StarsBackground";
import WelcomePage from "./components/WelcomePage";
import Login from "./components/Login";
import Signup from "./components/SignUp";
import { useAuth } from "./components/AuthContext";
import axios from "axios";

function App() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [birthdays, setBirthdays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false); 
  const [isWishLink, setIsWishLink] = useState(false);
  const [wishId, setWishId] = useState(null);

  useEffect(() => {
const path = window.location.pathname;
if (path.startsWith("/wish/")) {
  const id = path.split("/")[2];
  setIsWishLink(true);
  setWishId(id);
}

    if (user) {
      const fetchBirthdays = async () => {
        try {
          console.log("Current user:", user); 
          const response = await axios.get("/api/birthdays", {
            headers: {
              "user-id": user.id, 
            },
          });
          console.log("Fetched birthdays:", response.data); 

          if (response.data && response.data.length === 0) {
            setIsLoading(false);
            return;
          }

          const transformedData = response.data.map((birthday) => ({
            id: birthday.id,
            name: birthday.name,
            nickname: birthday.nickname,
            date: birthday.birth_date,
            zodiac: birthday.zodiac,
            photo: birthday.photo_url || "/images/default.jpg",
            giftIdeas: birthday.gift_ideas,
            hobbies: birthday.hobbies,
            favoriteColor: birthday.favorite_color,
            notes: birthday.notes,
            relationship: birthday.relationship,
            personalizedMessage: birthday.personalized_message,
            phone_number: birthday.phone_number, 
          }));

          setBirthdays(transformedData);
          setIsLoading(false);
          if (!path.startsWith("/wish/")) {
            setShowWelcome(true);
          }
        } catch (error) {
          console.error("Full error details:", error);
          console.error("Error response data:", error.response?.data);
          setIsLoading(false);
        }
      };

      fetchBirthdays();
    }
  }, [user]);

  const getTodaysBirthdays = () => {
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();

    return birthdays
      .filter((bday) => {
        const bdayDate = new Date(bday.date);
        return (
          bdayDate.getMonth() === todayMonth && bdayDate.getDate() === todayDay
        );
      })
      .map((bday) => ({
        ...bday,
        turningAge: getAge(bday.date) + 1, 
        message: bday.personalizedMessage || `Happy Birthday ${bday.name}! 🎉`,
      }));
  };

  const getUpcomingBirthdays = () => {
    const today = new Date();
    const currentYear = today.getFullYear();

    const todaysBirthdays = getTodaysBirthdays();
    const nextBirthday = todaysBirthdays.length > 0 ? null : getNextBirthday();
    const excludedIds = [
      ...todaysBirthdays.map((b) => b.id),
      ...(nextBirthday ? [nextBirthday.id] : []),
      console.log(
        "Excluded IDs:",
        todaysBirthdays.map((b) => b.id),
        nextBirthday ? nextBirthday.id : null
      ),
    ];

    return birthdays
      .filter((bday) => {
        if (!bday?.date) return false;
        if (excludedIds.includes(bday.id)) return false;

        const bdayDate = new Date(bday.date);
        let nextOccurrence = new Date(
          currentYear,
          bdayDate.getMonth(),
          bdayDate.getDate()
        );

        if (nextOccurrence < today) {
          nextOccurrence.setFullYear(currentYear + 1);
        }

        return nextOccurrence > today;
      })
      .sort((a, b) => {
        const aDate = new Date(a.date);
        const bDate = new Date(b.date);
        const aNext = new Date(currentYear, aDate.getMonth(), aDate.getDate());
        const bNext = new Date(currentYear, bDate.getMonth(), bDate.getDate());
        if (aNext < today) aNext.setFullYear(currentYear + 1);
        if (bNext < today) bNext.setFullYear(currentYear + 1);
        return aNext - bNext;
      })
      .slice(0, 4);
  };

  const getNextBirthday = () => {
    const today = new Date();
    const currentYear = today.getFullYear();

    const upcoming = birthdays
      .filter((bday) => {
        if (!bday?.date) return false;

        const bdayDate = new Date(bday.date);
        const isToday =
          bdayDate.getMonth() === today.getMonth() &&
          bdayDate.getDate() === today.getDate();
        return !isToday;
      })
      .map((bday) => {
        const bdayDate = new Date(bday.date);
        let nextOccurrence = new Date(
          currentYear,
          bdayDate.getMonth(),
          bdayDate.getDate()
        );

        if (nextOccurrence < today) {
          nextOccurrence.setFullYear(currentYear + 1);
        }

        return {
          ...bday,
          nextOccurrence,
          daysUntil: Math.ceil(
            (nextOccurrence - today) / (1000 * 60 * 60 * 24)
          ),
        };
      })
      .sort((a, b) => a.nextOccurrence - b.nextOccurrence);

    return upcoming.length > 0 ? upcoming[0] : null;
  };

  const addBirthday = async (formData) => {
    try {
      const response = await axios.post("/api/birthdays", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const addedBirthday = {
        id: response.data.id,
        name: response.data.name,
        nickname: response.data.nickname,
        date: response.data.birth_date,
        zodiac: response.data.zodiac,
        photo: response.data.photo_url || "/images/default.jpg",
        giftIdeas: response.data.gift_ideas,
        hobbies: response.data.hobbies,
        favoriteColor: response.data.favorite_color,
        notes: response.data.notes,
        relationship: response.data.relationship,
        personalizedMessage: response.data.personalized_message,
        phone_number: response.data.phone_number, 
      };

      setBirthdays((prev) => [...prev, addedBirthday]);
      navigate("/", { replace: true });
    } catch (error) {
      let errorMessage = "Failed to save birthday";
      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          errorMessage;
      }
      throw new Error(errorMessage);
    }
  };

  const updateBirthday = async (id, updatedData) => {
    try {
      console.log("[App] Starting update for:", id); // Log 11
      console.log("[App] Update data:", updatedData); // Log 12

      const response = await axios.put(`/api/birthdays/${id}`, {
        name: updatedData.name,
        nickname: updatedData.nickname,
        birth_date: updatedData.date,
        phone_number: updatedData.phone_number,
        relationship: updatedData.relationship,
        zodiac: updatedData.zodiac,
        photo_url: updatedData.photo,
        personalized_message: updatedData.personalizedMessage,
        favorite_color: updatedData.favoriteColor,
        hobbies: updatedData.hobbies,
        gift_ideas: updatedData.giftIdeas,
        notes: updatedData.notes,
      });

      console.log("[App] Server response:", response.data); // Log 13

      // Keep your existing return structure
      return {
        id: response.data.id,
        name: response.data.name,
        nickname: response.data.nickname,
        date: response.data.birth_date,
        phone_number: response.data.phone_number,
        relationship: response.data.relationship,
        zodiac: response.data.zodiac,
        photo: response.data.photo_url,
        personalizedMessage: response.data.personalized_message,
        favoriteColor: response.data.favorite_color,
        hobbies: response.data.hobbies,
        giftIdeas: response.data.gift_ideas,
        notes: response.data.notes,
      };
    } catch (error) {
      console.error("[App] Update error:", error); // Log 14
      throw error;
    }
  };

  
  const deleteBirthday = async (id) => {
    try {
      await axios.delete(`/api/birthdays/${id}`);
      setBirthdays(birthdays.filter((b) => b.id !== id));
      navigate("/all-birthdays"); 
    } catch (error) {
      console.error("Error deleting birthday:", error);
      alert("Failed to delete birthday. Please try again.");
    }
  };

  const getAge = (birthDate) => {
    if (!birthDate) return 0;

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
  };

  const handleGiftOpen = () => {
    setTimeout(() => {
      setShowWelcome(false);
      navigate(isWishLink ? `/wish/${wishId}` : "/");
    }, 2000);
  };

  if (authLoading) {
    return (
      <div className="app-wrapper">
        <StarsBackground />
        <div className="loading-container">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-wrapper">
        <StarsBackground />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div className="app-wrapper">
        <WelcomePage onGiftOpen={handleGiftOpen} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="app-wrapper">
        <StarsBackground />
        <div className="loading-container">Loading birthdays...</div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <StarsBackground />
      <Header />
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <div className="app-container">
              <Layout
                todaysBirthdays={getTodaysBirthdays()}
                upcomingBirthdays={getUpcomingBirthdays()}
                nextBirthday={getNextBirthday()}
                isEmpty={birthdays.length === 0}
              />
            </div>
          }
        />
        <Route
          path="/add-birthday"
          element={
            <div className="app-container">
              <AddBirthday
                addBirthday={addBirthday}
                onSuccess={() => navigate("/")}
              />
            </div>
          }
        />
        <Route
          path="/birthday/:id"
          element={
            <div className="app-container">
              <BirthdayDetail
                birthdays={birthdays}
                onDelete={deleteBirthday} 
              />
            </div>
          }
        />
        <Route
          path="/all-birthdays"
          element={
            <div className="app-container">
              <BirthdayList birthdays={birthdays} />
            </div>
          }
        />
        <Route
          path="/calendar"
          element={
            <div className="app-container">
              <CalendarView birthdays={birthdays} />
            </div>
          }
        />
        <Route
          path="/edit-birthday/:id"
          element={
            <EditBirthday
              birthdays={birthdays}
              updateBirthday={updateBirthday}
            />
          }
        />
        <Route
          path="/wish/:id"
          element={
            <div className="app-container">
              <BirthdayWish birthdays={birthdays} />
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
