import React from "react";
import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate, useLocation } from "react-router-dom";
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
import { AuthProvider, useAuth } from "./components/AuthContext";
import axios from "axios";
import WishNavbar from "./components/WishNavbar";
import StatePreserver from "./components/StatePreserver";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: authLoading, initializeAuth, logout } = useAuth();
  const [birthdays, setBirthdays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false); // Add this line
  const [hasSeenWelcome, setHasSeenWelcome] = useState(() => {
    return localStorage.getItem("hasSeenWelcome") === "true";
  });
  const [isWishLink, setIsWishLink] = useState(false);
  const [wishId, setWishId] = useState(null);

  useEffect(() => {
    // Ensure auth state is synchronized on route changes
    initializeAuth();
  }, [location.pathname, initializeAuth]);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith("/wish/")) {
      const id = path.split("/")[2];
      setIsWishLink(true);
      setWishId(id);
      setHasSeenWelcome(false);
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

      console.log("[App] Add birthday response:", response.data);

      // Transform the server response to match frontend format
      const addedBirthday = {
        id: response.data.data.id,
        name: response.data.data.name,
        nickname: response.data.data.nickname,
        date: response.data.data.birth_date,
        zodiac: response.data.data.zodiac,
        photo:
          response.data.data.photo_url ||
          "https://res.cloudinary.com/dffrevtpk/image/upload/v1752938164/default_lcjcji.jpg",
        giftIdeas: response.data.data.gift_ideas,
        hobbies: response.data.data.hobbies,
        favoriteColor: response.data.data.favorite_color,
        notes: response.data.data.notes,
        relationship: response.data.data.relationship,
        personalizedMessage: response.data.data.personalized_message,
        phone_number: response.data.data.phone_number,
      };

      // Update the birthdays state
      setBirthdays((prev) => [...prev, addedBirthday]);

      // Navigate to the birthday list
      navigate("/all-birthdays");
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
      console.log("[App] Starting update for:", id);
      console.log("[App] Update data:", updatedData);

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

      console.log("[App] Full server response:", response);
      console.log("[App] Response data:", response.data);

      const serverData = response.data.data;

      // Keep your existing return structure
      const transformedData = {
        id: serverData.id,
        name: serverData.name,
        nickname: serverData.nickname,
        date: serverData.birth_date,
        phone_number: serverData.phone_number,
        relationship: serverData.relationship,
        zodiac: serverData.zodiac,
        photo: serverData.photo_url,
        personalizedMessage: serverData.personalized_message,
        favoriteColor: serverData.favorite_color,
        hobbies: serverData.hobbies,
        giftIdeas: serverData.gift_ideas,
        notes: serverData.notes,
      };

      setBirthdays((prev) =>
        prev.map((b) => (b.id === parseInt(id) ? transformedData : b))
      );

      return transformedData;
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
    setHasSeenWelcome(true);
    localStorage.setItem("hasSeenWelcome", "true");
    if (isWishLink && wishId) {
      navigate(`/wish/${wishId}`, { state: { fromWelcome: true } });
    } else {
      navigate("/");
    }
  };

  if (!hasSeenWelcome && (isWishLink || !user)) {
    return (
      <div className="app-wrapper">
        <WelcomePage onGiftOpen={handleGiftOpen} />
      </div>
    );
  }

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
        <WelcomePage
          onGiftOpen={() => {
            setShowWelcome(false);
            navigate("/");
          }}
        />
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
      {isWishLink ? <WishNavbar /> : <Navbar />}
      <Routes>
        <Route
          path="/"
          element={
            <StatePreserver>
              <div className="app-container">
                <Layout
                  todaysBirthdays={getTodaysBirthdays()}
                  upcomingBirthdays={getUpcomingBirthdays()}
                  nextBirthday={getNextBirthday()}
                  isEmpty={birthdays.length === 0}
                />
              </div>
            </StatePreserver>
          }
        />
        <Route
          path="/add-birthday"
          element={
            <StatePreserver>
              <div className="app-container">
                <AddBirthday addBirthday={addBirthday} />
              </div>
            </StatePreserver>
          }
        />
        <Route
          path="/birthday/:id"
          element={
            <StatePreserver>
              <div className="app-container">
                <BirthdayDetail
                  birthdays={birthdays}
                  onDelete={deleteBirthday}
                />
              </div>
            </StatePreserver>
          }
        />
        <Route
          path="/all-birthdays"
          element={
            <StatePreserver>
              <div className="app-container">
                <BirthdayList birthdays={birthdays} />
              </div>
            </StatePreserver>
          }
        />
        <Route
          path="/calendar"
          element={
            <StatePreserver>
              <div className="app-container">
                <CalendarView birthdays={birthdays} />
              </div>
            </StatePreserver>
          }
        />
        <Route
          path="/edit-birthday/:id"
          element={
            <StatePreserver>
              <EditBirthday
                birthdays={birthdays}
                updateBirthday={updateBirthday}
              />
            </StatePreserver>
          }
        />
        <Route
          path="/wish/:id"
          element={
            <StatePreserver>
              <BirthdayWish birthdays={birthdays} isPublic={true} />
            </StatePreserver>
          }
        />
        <Route
          path="/login"
          element={
            <StatePreserver>
              <Login showHeader={true} />
            </StatePreserver>
          }
        />
        <Route
          path="/signup"
          element={
            <StatePreserver>
              <Signup />
            </StatePreserver>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
