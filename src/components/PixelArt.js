import React from 'react';
import './styles.css';

export const PixelCake = () => (
  <div className="pixel-cake" />
);

export const PixelBalloon = ({ color = '#eb4d4b', position = 'top-left' }) => (
  <div 
    className="pixel-balloon"
    style={{
      backgroundColor: color,
      top: position.includes('top') ? '40px' : 'auto',
      bottom: position.includes('bottom') ? '40px' : 'auto',
      left: position.includes('left') ? '60px' : 'auto',
      right: position.includes('right') ? '60px' : 'auto'
    }}
  />
);

export const PixelGift = () => (
  <div className="pixel-gift">
    <div className="pixel-gift-box" />
    <div className="pixel-gift-bow" />
  </div>
);