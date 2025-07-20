import React, { useState, useRef, useEffect } from "react";
import "../styles/WelcomePage.css";
import StarsBackground from "./StarsBackground";
import Confetti from "react-confetti";
import { useNavigate, useLocation } from "react-router-dom";

const WelcomePage = ({ onGiftOpen }) => {
  const [isOpened, setIsOpened] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiSize, setConfettiSize] = useState({ width: 0, height: 0 });
  const [explosionPosition, setExplosionPosition] = useState({ x: 0, y: 0 });
  const giftRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if this is a wish link
  const isWishLink = location.pathname.startsWith("/wish/");
  const wishId = isWishLink ? location.pathname.split("/")[2] : null;

  const handleGiftOpen = () => {
    // Clear any existing authentication
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");

    if (isWishLink) {
      // For wish links, navigate to the wish page after animation
      setTimeout(() => {
        navigate(`/wish/${wishId}`);
      }, 1000);
    } else {
      // For regular app entry, use the provided onGiftOpen
      onGiftOpen();
    }
  };

  const sparklePositions = [
    { tx: "-40px", ty: "-60px", delay: "0s", size: "8px" },
    { tx: "30px", ty: "-80px", delay: "0.1s", size: "6px" },
    { tx: "-20px", ty: "-120px", delay: "0.2s", size: "10px" },
    { tx: "50px", ty: "-40px", delay: "0.3s", size: "7px" },
    { tx: "-60px", ty: "-90px", delay: "0.4s", size: "9px" },
    { tx: "10px", ty: "-110px", delay: "0.5s", size: "5px" },
    { tx: "40px", ty: "-70px", delay: "0.6s", size: "8px" },
    { tx: "-30px", ty: "-50px", delay: "0.7s", size: "6px" },
    { tx: "20px", ty: "-100px", delay: "0.8s", size: "7px" },
    { tx: "-50px", ty: "-80px", delay: "0.9s", size: "9px" },
    { tx: "60px", ty: "-60px", delay: "1s", size: "5px" },
    { tx: "-10px", ty: "-90px", delay: "1.1s", size: "8px" },
  ];

  const handleClick = () => {
    if (!isOpened) {
      setIsOpened(true);

      if (giftRef.current) {
        const rect = giftRef.current.getBoundingClientRect();
        setExplosionPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }

      setConfettiSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setShowConfetti(true);

      // Trigger the gift open handler
      handleGiftOpen();
    }
  };

  const ConfettiPiece = ({ style }) => {
    return <div className="confetti-piece" style={style} />;
  };

  const generateExplosionConfetti = () => {
    const pieces = [];
    const colors = ["#fef4b5", "#a332d5", "#f9547a", "#ff6857", "#f98c53"];

    for (let i = 0; i < 250; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 8 + Math.random() * 15;
      const size = 6 + Math.random() * 10;
      const color = colors[Math.floor(Math.random() * colors.length)];

      pieces.push({
        id: i,
        angle,
        velocity,
        size,
        color,
        x: explosionPosition.x,
        y: explosionPosition.y,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 30,
      });
    }

    return pieces;
  };

  const [explosionPieces, setExplosionPieces] = useState([]);

  useEffect(() => {
    if (isOpened) {
      setExplosionPieces(generateExplosionConfetti());

      const interval = setInterval(() => {
        setExplosionPieces((prevPieces) =>
          prevPieces
            .map((piece) => ({
              ...piece,
              x: piece.x + Math.cos(piece.angle) * piece.velocity * 0.5,
              y: piece.y + Math.sin(piece.angle) * piece.velocity * 0.5 + 0.8,
              rotation: piece.rotation + piece.rotationSpeed * 0.5,
            }))
            .filter((piece) => piece.y < window.innerHeight)
        );
      }, 16);

      return () => clearInterval(interval);
    }
  }, [isOpened, explosionPosition]);

  return (
    <div className="welcome-container">
      <StarsBackground />
      {showConfetti && (
        <>
          <Confetti
            width={confettiSize.width}
            height={confettiSize.height}
            recycle={false}
            numberOfPieces={400}
            gravity={0.3}
            colors={["#fef4b5", "#a332d5", "#f9547a", "#ff6857", "#f98c53"]}
            style={{ position: "fixed" }}
          />

          {/* Explosion confetti */}
          {explosionPieces.map((piece) => (
            <ConfettiPiece
              key={piece.id}
              style={{
                position: "fixed",
                left: `${piece.x}px`,
                top: `${piece.y}px`,
                width: `${piece.size}px`,
                height: `${piece.size}px`,
                backgroundColor: piece.color,
                borderRadius: "50%",
                transform: `rotate(${piece.rotation}deg)`,
                opacity: 0.8,
                zIndex: 10,
              }}
            />
          ))}
        </>
      )}

      <div className="welcome-content">
        <h1>
          {isWishLink
            ? "You've Received a Birthday Wish!"
            : "Welcome to Birthday Reminder!"}
        </h1>
        <p>
          {isWishLink
            ? "Click the gift to see your special message"
            : "Never miss a special day again"}
        </p>

        <div className="decoration-container">
          <img
            src="/images/moon_star.png"
            alt="Moon and Star"
            className="decoration moon-star"
          />
          <img
            src="/images/ribbon.png"
            alt="Ribbon"
            className="decoration ribbon"
          />
          <img
            src="/images/hat.png"
            alt="Party Hat"
            className="decoration hat"
          />
          <img
            src="/images/rainbow.png"
            alt="Rainbow"
            className="decoration rainbow"
          />
          <img
            src="/images/heart.png"
            alt="Heart 1"
            className="decoration heart1"
          />
          <img
            src="/images/heart.png"
            alt="Heart 2"
            className="decoration heart2"
          />
          <img src="/images/wish.png" alt="Wish" className="decoration wish" />
          <img
            src="/images/balloon.png"
            alt="Balloon"
            className="decoration balloon"
          />
        </div>

        <div className="gift-surroundings">
          <img
            src="/images/cake.png"
            alt="Birthday Cake"
            className="side-decoration cake"
          />
          <img
            src="/images/balloons.png"
            alt="Balloons"
            className="side-decoration balloons"
          />
        </div>

        <div className="gift-button-container" ref={giftRef}>
          <img
            src="/images/gift.png"
            alt="Click to open gift"
            className={`gift-image ${isOpened ? "opened" : ""}`}
            onClick={handleClick}
          />

          {isOpened && (
            <div className="gift-sparkles">
              {sparklePositions.map((sparkle, index) => (
                <div
                  key={index}
                  className="sparkle"
                  style={{
                    "--tx": sparkle.tx,
                    "--ty": sparkle.ty,
                    "--size": sparkle.size,
                    animationDelay: sparkle.delay,
                    width: sparkle.size,
                    height: sparkle.size,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <p className="instruction">
          Click the gift to {isWishLink ? "see your wish" : "begin"}!
        </p>
      </div>
    </div>
  );
};

export default WelcomePage;
