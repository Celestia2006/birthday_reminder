import React from "react";
import "../styles/Header.css";

const Header = () => {
  return (
    <div className="header-container">
      {/* Moon on the left 
      <div className="moon-container">
        <img src="/images/Moon.png" alt="Moon" className="moon-image" />
      </div>*/}

      {/* Your existing header title */}
      <h1 className="header">BIRTHDAY REMINDER</h1>

      {/* Clouds on the right */}
      {/*<div className="clouds-container">
        <img src="/images/cloud1.png" alt="Cloud" className="cloud-image" />
        {/*<img src="/images/cloud2.png" alt="Cloud" className="cloud-image" />*/}
        {/*<img src="/images/cloud3.png" alt="Cloud" className="cloud-image" />
      </div>*/}
    </div>
  );
};

export default Header;
