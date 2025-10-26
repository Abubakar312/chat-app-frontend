import React, { useState, useEffect } from 'react';
import API_URL from '../apiConfig'; // Correctly imported
import './NewGroupModal.css';

const ManageGroupModal = ({ onClose, onGroupUpdated, conversation }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [userToAdd, setUserToAdd] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${API_URL}/api/users`, { // Correctly used
          headers: { 'x-auth-token': token },
        });
        const data = await response.json();
        const existingMemberIds = conversation.members.map(m => m._id);
        const availableUsers = data.filter(u => !existingMemberIds.includes(u._id));
        setAllUsers(availableUsers);
      } catch (error) { console.error('Failed to fetch users:', error); }
    };
    fetchUsers();
  }, [conversation.members]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!userToAdd) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/conversations/${conversation._id}/members`, { // Correctly used
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ userIdToAdd: userToAdd }),
      });
      if (!response.ok) throw new Error('Failed to add member');
      const updatedConversation = await response.json();
      onGroupUpdated(updatedConversation);
      setUserToAdd('');
    } catch (error) { console.error('Add member error:', error); }
  };

  const handleRemoveMember = async (memberIdToRemove) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/conversations/${conversation._id}/members/${memberIdToRemove}`, { // Correctly used
        method: 'DELETE',
        headers: { 'x-auth-token': token },
      });
      if (!response.ok) throw new Error('Failed to remove member');
      const updatedConversation = await response.json();
      onGroupUpdated(updatedConversation);
    } catch (error) { console.error('Remove member error:', error); }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Manage "{conversation.name}"</h2>
        <form onSubmit={handleAddMember}>
          <h3>Add New Member</h3>
          <div className="add-member-form">
            <select 
              value={userToAdd} 
              onChange={(e) => setUserToAdd(e.target.value)}
              className="group-name-input"
            >
              <option value="" disabled>Choose a user to add...</option>
              {allUsers.map(user => (
                <option key={user._id} value={user._id}>{user.username}</option>
              ))}
            </select>
            <button type="submit" className="btn-create" style={{marginLeft: '10px'}}>Add</button>
          </div>
        </form>
        <hr style={{margin: '20px 0'}} />
        <h3>Current Members</h3>
        <ul className="member-list">
          {conversation.members.map(member => (
            <li key={member._id} className="member-item">
              <span>{member.username} {conversation.groupAdmin === member._id && '(Admin)'}</span>
              {conversation.groupAdmin !== member._id && (
                <button onClick={() => handleRemoveMember(member._id)} className="btn-remove">
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-cancel">Done</button>
        </div>
      </div>
    </div>
  );
};

export default ManageGroupModal;
