import React, { useState, useEffect } from 'react';
import './NewGroupModal.css';

const NewGroupModal = ({ onClose, onGroupCreated }) => {
  const [groupName, setGroupName] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('https://my-chat-app-backend123.onrender.com/api/users', {
          headers: { 'x-auth-token': token },
        } );
        const data = await response.json();
        setAllUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, []);

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
      onGroupCreated(newGroup);
      onClose();
    } catch (error) {
      console.error('Group creation error:', error);
      alert(error.message);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
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
            required
            className="group-name-input"
          />
          <h3>Select Members</h3>
          <ul className="user-list">
            {allUsers.map(user => (
              <li key={user._id} className="user-list-item">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => handleUserSelect(user._id)}
                  />
                  {user.username}
                </label>
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
