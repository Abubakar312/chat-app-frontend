
import React, { useState, useEffect } from 'react';
import './NewGroupModal.css';
const API_URL = 'https://my-chat-app-backend123.onrender.com';
const NewGroupModal = ({ onClose, onGroupCreated }) => {
  const [users, setUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Fetch all users to display them as options
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('https://my-chat-app-backend123.onrender.com/api/users', {
          headers: { 'x-auth-token': token },
        } );
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId) // Deselect if already selected
        : [...prev, userId] // Select if not selected
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName || selectedUsers.length === 0) {
      alert('Please provide a group name and select at least one member.');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('https://my-chat-app-backend123.onrender.com/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ name: groupName, members: selectedUsers } ),
      });

      if (!response.ok) throw new Error('Failed to create group');
      
      const newGroup = await response.json();
      onGroupCreated(newGroup); // Pass the new group back to the parent
      onClose(); // Close the modal

    } catch (error) {
      console.error('Group creation error:', error);
      alert(error.message);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Create New Group</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="group-name-input"
            required
          />
          <h3>Select Members</h3>
          <ul className="user-list">
            {users.map(user => (
              <li
                key={user._id}
                onClick={() => handleUserSelect(user._id)}
                className={selectedUsers.includes(user._id) ? 'selected' : ''}
              >
                {user.username}
              </li>
            ))}
          </ul>
          <div className="modal-actions">
            <button type="submit" className="btn-create">Create</button>
            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewGroupModal;
