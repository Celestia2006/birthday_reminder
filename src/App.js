import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from "react-router-dom"; 
import Layout from './components/Layout';
import Header from './components/Header';
import AddBirthday from './components/AddBirthday';
import Navbar from './components/Navbar';
import BirthdayList from './components/BirthdayList';
import CalendarView from './components/CalendarView';
import './styles/App.css';
import "./styles/EditBirthday.css";
import BirthdayDetail from './components/BirthdayDetail';
import EditBirthday from "./components/EditBirthday";
import StarsBackground from "./components/StarsBackground";
import WelcomePage from './components/WelcomePage';

function App() {
  const navigate = useNavigate();
  const [birthdays, setBirthdays] = useState([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  // Initialize data - DEVELOPMENT MODE: Always use fresh sample data
  useEffect(() => {
    console.log("Initializing with fresh sample data");

    // Force clear any existing data
    localStorage.removeItem("birthdays");

    const sampleBirthdays = [
      {
        id: 1,
        name: "Percy Jackson",
        nickname: "Seaweed Brain",
        date: getDemoBirthdate(0, 16), // Today
        zodiac: "Leo",
        photo: "/images/percy.jpg",
        giftIdeas: "Riptide pen, Blue food, Water balloons",
        hobbies: "Sword fighting, Swimming",
        favoriteColor: "Blue",
        notes: "Loves Greek mythology and sea adventures",
        age: new Date().getFullYear() - 2000,
        canonicalAge: 16,
      },
      {
        id: 2,
        name: "Annabeth Chase",
        nickname: "Wise Girl",
        date: getDemoBirthdate(1, 16), // Tomorrow
        zodiac: "Cancer",
        photo: "/images/annabeth.jpg",
        giftIdeas: "Architecture books, Puzzles, Yankees cap",
        hobbies: "Reading, Designing buildings, Strategy games",
        favoriteColor: "Gray",
        notes: "Enjoys solving puzzles and loves architecture",
        age: new Date().getFullYear() - 2000,
        canonicalAge: 16,
      },
      {
        id: 3,
        name: "Grover Underwood",
        nickname: "G-Man",
        date: getDemoBirthdate(5, 16), // 5 days from now
        zodiac: "Capricorn",
        photo: "/images/grover.jpg",
        giftIdeas: "Nature Guide, Pan flute, Hiking gear",
        hobbies: "Protecting nature, Playing reed pipes, Finding Pan",
        favoriteColor: "Green",
        notes: "Loves enchiladas",
        age: new Date().getFullYear() - 1999,
        canonicalAge: 16,
      },
      {
        id: 4,
        name: "Luke Castellan",
        nickname: "Golden Boy",
        date: getDemoBirthdate(10, 23), // 10 days from now
        zodiac: "Aquarius",
        photo: "/images/luke.jpg",
        giftIdeas: "Leather Jacket, Music Album, Travel Gear",
        hobbies: "Sword Training, Music, Rebellion",
        favoriteColor: "Black",
        notes: "Has a rebellious spirit and loves music",
        canonicalAge: 23,
      },
      {
        id: 5,
        name: "Clarisse La Rue",
        nickname: "Ares Junior",
        date: getDemoBirthdate(15, 18),
        zodiac: "Aries",
        photo: "/images/clarisse.jpg",
        giftIdeas: "Battle Gear, Training Equipment, Leather Armor",
        hobbies: "Combat Training, Chariot Racing",
        favoriteColor: "Red",
        notes: "Strong and competitive, loves a good challenge",
        canonicalAge: 18,
      },
    ];

    console.log("Sample data created:", sampleBirthdays);
    setBirthdays(sampleBirthdays);
    localStorage.setItem("birthdays", JSON.stringify(sampleBirthdays));
    setIsInitialized(true);
    console.log("Data saved to localStorage");
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("birthdays", JSON.stringify(birthdays));
      console.log("Data updated in localStorage");
    }
  }, [birthdays, isInitialized]);

  // Add this to App.js to keep localStorage and state in sync
  useEffect(() => {
    if (birthdays.length > 0) {
      localStorage.setItem("birthdays", JSON.stringify(birthdays));
    }
  }, [birthdays]); // This will run whenever birthdays state changes

  // Helper function to create demo birthdates
  const getDemoBirthdate = (daysToAdd, age) => {
    const today = new Date();
    const currentYear = today.getFullYear();

    const date = new Date(today);
    date.setDate(today.getDate() + daysToAdd);
    const birthYear = currentYear - age;
    return `${birthYear}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  };

  const addBirthday = (newBirthday) => {
    const updatedBirthdays = [
      ...birthdays,
      {
        ...newBirthday,
        id:
          birthdays.length > 0
            ? Math.max(...birthdays.map((b) => b.id)) + 1
            : 1,
        age:
          new Date().getFullYear() - new Date(newBirthday.date).getFullYear(),
      },
    ];
    setBirthdays(updatedBirthdays);
  };

  // Get today's birthdays with congratulatory message
  const getTodaysBirthdays = () => {
    const today = new Date();
    const todayMonth = today.getMonth() + 1; // Months are 0-indexed
    const todayDay = today.getDate();

    const todays = birthdays
      .filter((bday) => {
        const bdayDate = new Date(bday.date);
        return (
          bdayDate.getMonth() + 1 === todayMonth &&
          bdayDate.getDate() === todayDay
        );
      })
      .map((bday) => ({
        ...bday,
        message: `Happy Birthday ${bday.name}! 🎉`,
        turningAge: bday.canonicalAge + 1,
      }));

    console.log("Today's birthdays found:", todays);
    return todays;
  };

  // Get upcoming birthdays (next 30 days)
  const getUpcomingBirthdays = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 30);

    return birthdays
      .map((bday) => {
        const bdayDate = new Date(bday.date);
        // Create a date in current year for comparison
        const currentYearDate = new Date(
          currentYear,
          bdayDate.getMonth(),
          bdayDate.getDate()
        );
        return { ...bday, currentYearDate };
      })
      .filter(({ currentYearDate }) => {
        return currentYearDate > today && currentYearDate <= nextMonth;
      })
      .sort((a, b) => a.currentYearDate - b.currentYearDate)
      .slice(0, 4)
      .map(({ currentYearDate, ...bday }) => bday); // Remove temp date
  };

  const updateBirthday = (id, updatedData) => {
    const updatedBirthdays = birthdays.map((b) =>
      b.id === id ? { ...b, ...updatedData } : b
    );
    setBirthdays(updatedBirthdays);
    localStorage.setItem("birthdays", JSON.stringify(updatedBirthdays));
  };

  const handleGiftOpen = () => {
    setTimeout(() => {
      setShowWelcome(false);
      navigate("/"); // Navigate to home after animation
    }, 2000);
  };

  if (showWelcome) {
    return (
      <div className="app-wrapper">
        <WelcomePage onGiftOpen={handleGiftOpen} />
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
              />
            </div>
          }
        />
        <Route
          path="/add-birthday"
          element={
            <div className="app-container">
              <AddBirthday addBirthday={addBirthday} />
            </div>
          }
        />
        <Route
          path="/birthday/:id"
          element={
            <div className="app-container">
              <BirthdayDetail
                birthdays={birthdays}
                setBirthdays={setBirthdays} // Make sure this is passed
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
          path="/"
          element={
            <div className="app-container">
              <Layout
                todaysBirthdays={getTodaysBirthdays()}
                upcomingBirthdays={getUpcomingBirthdays()}
              />
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;