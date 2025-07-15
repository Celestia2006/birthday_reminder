import React, { useState, useEffect } from "react";
import "../styles/StarsBackground.css";

const StarsBackground = () => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const newStars = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 3,
      left: Math.random() * 100,
      top: 80 + Math.random() * 20,
      duration: 10 + Math.random() * 15,
      delay: 0,
      opacity: 0.4 + Math.random() * 0.6,
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="stars-container">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            "--size": `${star.size}px`,
            "--glow": `${star.size * 2}px`,
            left: `${star.left}%`,
            top: `${star.top}%`,
            animation: `floatUp ${star.duration}s linear ${star.delay}s infinite`,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  );
};

export default StarsBackground;
