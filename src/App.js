import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import ChatPage from './pages/ChatPage';

// A custom component to protect routes
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  // If a token exists, allow access to the page. Otherwise, redirect to login.
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        {/* The main chat page is now protected */}
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
          } 
        />
        
        {/* Add a catch-all to redirect to the main page if a route doesn't exist */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
