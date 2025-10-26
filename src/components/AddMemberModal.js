import React, { useState, useEffect } from 'react';
import './NewGroupModal.css';

const AddMemberModal = ({ onClose, onMemberAdded, conversation }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [userToAdd, setUserToAdd] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('https://my-chat-app-backend123.onrender.com/api/users', {
          headers: { 'x-auth-token': token },
        } );
        const data = await response.json();
        const existingMemberIds = conversation.members.map(m => m._id);
        const availableUsers = data.filter(u => !existingMemberIds.includes(u._id));
        setAllUsers(availableUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, [conversation.members]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userToAdd) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://my-chat-app-backend123.onrender.com/api/conversations/${conversation._id}/members`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ userIdToAdd: userToAdd } ),
      });
      if (!response.ok) throw new Error('Failed to add member');
      const updatedConversation = await response.json();
      onMemberAdded(updatedConversation); // This was the original prop name
      onClose();
    } catch (error) {
      console.error('Add member error:', error);
      alert(error.message);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Add Member to "{conversation.name}"</h2>
        <form onSubmit={handleSubmit}>
          <h3>Select a user to add</h3>
          <select 
            value={userToAdd} 
            onChange={(e) => setUserToAdd(e.target.value)}
            className="group-name-input"
          >
            <option value="" disabled>Choose a user...</option>
            {allUsers.map(user => (
              <option key={user._id} value={user._id}>{user.username}</option>
            ))}
          </select>
          <div className="modal-actions">
            <button type="submit" className="btn-create">Add Member</button>
            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
