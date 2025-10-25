
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';

import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import Welcome from '../components/Welcome';
import NewGroupModal from '../components/NewGroupModal';
import AddMemberModal from '../components/AddMemberModal'; // <-- Import new modal
import './ChatPage.css';
const API_URL = 'https://my-chat-app-backend123.onrender.com';
const ChatPage = () => {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false); // <-- New state
  const [onlineUsers, setOnlineUsers] = useState([]);
  const navigate = useNavigate();
  const socketRef = useRef(null);

  // Main setup effect - runs only once
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    try {
      const decodedUser = jwtDecode(token).user;
      setUser(decodedUser);

      const socket = io('https://my-chat-app-backend123.onrender.com' );
      socketRef.current = socket;

      socket.emit('setup', decodedUser.id);
      socket.on('online users', (users) => setOnlineUsers(users));

      fetch('https://my-chat-app-backend123.onrender.com/api/conversations', { headers: { 'x-auth-token': token } } )
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setConversations(data);
            data.forEach(convo => socket.emit('join room', convo._id));
          }
        });

      socket.on('chat message', (newMessage) => {
        setConversations(prevConvos =>
          prevConvos.map(convo =>
            convo._id === newMessage.conversationId ? { ...convo, lastMessage: newMessage } : convo
          )
        );
      });

    } catch (error) {
      localStorage.removeItem('token');
      navigate('/login');
    }

    return () => {
      const socket = socketRef.current;
      if (socket) {
        socket.off('chat message');
        socket.disconnect();
      }
    };
  }, [navigate]);

  // Effect to fetch messages when a conversation is selected
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }
    const token = localStorage.getItem('token');
    fetch('https://my-chat-app-backend123.onrender.com/api/conversations', { headers: { 'x-auth-token': token } } )
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data);
          if (socketRef.current && user) {
            socketRef.current.emit('messages seen', { conversationId: selectedConversation._id, userId: user.id });
          }
        }
      });
  }, [selectedConversation, user]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleGroupCreated = (newGroup) => {
    setConversations(prev => [newGroup, ...prev]);
    if (socketRef.current) socketRef.current.emit('join room', newGroup._id);
    setSelectedConversation(newGroup);
  };

  const handleStartDirectMessage = async (recipientId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http:// https://my-chat-app-backend123.onrender.com/api/conversations/dm/${recipientId}`, { method: 'POST', headers: { 'x-auth-token': token } } );
      const dmConversation = await response.json();
      const existingConvo = conversations.find(c => c._id === dmConversation._id);
      if (!existingConvo) {
        setConversations(prev => [dmConversation, ...prev]);
        if (socketRef.current) socketRef.current.emit('join room', dmConversation._id);
      }
      setSelectedConversation(dmConversation);
    } catch (error) { console.error('Failed to start DM:', error); }
  };
  
  // --- NEW HANDLER ---
  const handleMemberAdded = (updatedConversation) => {
    setConversations(prev => 
      prev.map(c => c._id === updatedConversation._id ? updatedConversation : c)
    );
    setSelectedConversation(updatedConversation);
  };

  const handleLogout = () => {
    if (socketRef.current) socketRef.current.disconnect();
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <>
      {isModalOpen && <NewGroupModal onClose={() => setIsModalOpen(false)} onGroupCreated={handleGroupCreated} />}
      
      {/* --- NEW MODAL RENDER --- */}
      {isAddMemberModalOpen && selectedConversation && (
        <AddMemberModal
          onClose={() => setIsAddMemberModalOpen(false)}
          onMemberAdded={handleMemberAdded}
          conversation={selectedConversation}
        />
      )}

      <div className="dashboard-container">
        <div className="sidebar">
          <Sidebar 
            conversations={conversations} 
            onSelectConversation={handleSelectConversation}
            currentUserId={user.id}
            onStartDirectMessage={handleStartDirectMessage}
            onlineUsers={onlineUsers}
          />
        </div>
        <div className="main-content">
          <div className="main-header">
            <button onClick={() => setIsModalOpen(true)} className="new-group-btn">+ New Group</button>
            <div>Welcome, {user.username}!</div>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
          <div className="chat-area">
            {selectedConversation ? (
              <ChatWindow 
                key={selectedConversation._id} 
                conversation={selectedConversation} 
                user={user}
                socket={socketRef.current}
                initialMessages={messages}
                onAddMemberClick={() => setIsAddMemberModalOpen(true)} // <-- Pass handler
              />
            ) : (
              <Welcome username={user.username} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatPage;
