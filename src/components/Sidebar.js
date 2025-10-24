import React, { useState, useEffect } from 'react';
import './Sidebar.css';

const Sidebar = ({ conversations, onSelectConversation, currentUserId, onStartDirectMessage, onlineUsers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const groupChats = conversations.filter(c => c.isGroup);
  const directMessages = conversations.filter(c => !c.isGroup);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setUsers([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:5000/api/users', { headers: { 'x-auth-token': token } } );
        const data = await response.json();
        const filteredUsers = data.filter(user => user.username.toLowerCase().includes(searchTerm.toLowerCase()));
        setUsers(filteredUsers);
      } catch (error) { console.error('Failed to fetch users:', error); }
    };
    const delayDebounce = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleSelectUser = (userId) => {
    onStartDirectMessage(userId);
    setSearchTerm('');
    setIsSearching(false);
  };

  const ConversationList = ({ title, convos }) => (
    <div className="conversation-section">
      <h4>{title}</h4>
      {convos.length > 0 ? (
        convos.map(convo => {
          let displayName = convo.name;
          let otherUserId = null;
          let isOnline = false;

          if (!convo.isGroup) {
            const otherUser = convo.members.find(member => member._id !== currentUserId);
            if (otherUser) {
              displayName = otherUser.username;
              otherUserId = otherUser._id;
              // --- NEW: Check if the other user is online ---
              isOnline = onlineUsers.includes(otherUserId);
            }
          }

          return (
            <div key={convo._id} className="conversation-item" onClick={() => onSelectConversation(convo)}>
              <div className="avatar-container"> {/* NEW container for avatar and dot */}
                <div className="convo-avatar">{displayName.charAt(0).toUpperCase()}</div>
                {/* --- NEW: Show online dot for DMs --- */}
                {!convo.isGroup && isOnline && <div className="online-dot"></div>}
              </div>
              <div className="convo-details">
                <div className="convo-name">{displayName}</div>
                <div className="convo-last-message">
                  {convo.lastMessage ? convo.lastMessage.content : 'No messages yet...'}
                </div>
              </div>
            </div>
          );
        })
      ) : ( <div className="no-conversations">No {title.toLowerCase()} yet.</div> )}
    </div>
  );

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <input type="text" placeholder="Search to start a new chat..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>
      <div className="conversation-list-container">
        {isSearching ? (
          <div className="search-results">
            <h4>Start a new chat</h4>
            {users.map(user => (
              <div key={user._id} className="user-item" onClick={() => handleSelectUser(user._id)}>
                <div className="avatar-container">
                  <div className="convo-avatar">{user.username.charAt(0).toUpperCase()}</div>
                  {onlineUsers.includes(user._id) && <div className="online-dot"></div>}
                </div>
                <div className="convo-name">{user.username}</div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <ConversationList title="Group Chats" convos={groupChats} />
            <ConversationList title="Direct Messages" convos={directMessages} />
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
