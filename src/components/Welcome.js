import React from 'react';
import './Welcome.css';

const Welcome = ({ username }) => {
  return (
    <div className="welcome-container">
      <h2>Welcome, {username}!</h2>
      <p>Select a conversation from the sidebar to start chatting.</p>
    </div>
  );
};

export default Welcome;
