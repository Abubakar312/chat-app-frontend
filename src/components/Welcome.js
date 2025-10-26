import React from 'react';

const Welcome = ({ username }) => {
  return (
    <div className="welcome-container">
      <h2>Welcome, {username}!</h2>
      <p>Select a conversation to start chatting.</p>
      <div className="footer-credit">
        <p>
          Crafted with ❤️ by Abubakar
        </p>
        <a 
          href="https://github.com/Abubakar312" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{color: '#0366d6', textDecoration: 'none'}}
        >
          View My GitHub
        </a>
      </div>
    </div>
   );
};

export default Welcome;
