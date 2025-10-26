import React, { useState, useEffect, useRef } from 'react';
import '../App.css';

const ChatWindow = ({ conversation, user, socket, initialMessages, onManageGroupClick }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleChatMessage = (newMessage) => {
      if (newMessage.conversationId === conversation._id) {
        setMessages(prevMessages => [...prevMessages, newMessage]);
        if (user) {
          socket.emit('messages seen', { conversationId: conversation._id, userId: user.id });
        }
      }
    };

    socket.on('chat message', handleChatMessage);

    return () => {
      socket.off('chat message', handleChatMessage);
    };
  }, [conversation._id, socket, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (input.trim() && user && conversation && socket) {
      const messageData = {
        conversationId: conversation._id,
        senderId: user.id,
        senderUsername: user.username,
        content: input,
      };
      socket.emit('chat message', messageData);
      setInput('');
    }
  };

  let chatName = 'Chat';
  if (conversation) {
    if (conversation.isGroup) {
      chatName = conversation.name;
    } else {
      const otherUser = conversation.members.find(member => member._id !== user.id);
      chatName = otherUser ? otherUser.username : 'Direct Message';
    }
  }

  return (
    <div className="chat-window">
      <header className="chat-header">
        <div>{chatName}</div>
        {/* --- ADD MEMBER BUTTON --- */}
        {conversation.isGroup && conversation.groupAdmin === user.id && (
          <button onClick={onManageGroupClick} className="add-member-btn">Manage</button>
        )}
      </header>
      <ul className="message-list">
        {messages.map((msg) => {
          const isMyMessage = msg.senderId === user.id;
          const isSeen = msg.readBy.length === conversation.members.length;

          return (
            <li key={msg._id} className={`message ${isMyMessage ? 'my-message' : 'other-message'}`}>
              {conversation.isGroup && !isMyMessage && <div className="message-sender">{msg.senderUsername}</div>}
              <div className="message-content">{msg.content}</div>
              {isMyMessage && (
                <div className={`message-status ${isSeen ? 'seen' : ''}`}>
                  {isSeen ? '✓✓' : '✓'}
                </div>
              )}
            </li>
          );
        })}
        <div ref={messagesEndRef} />
      </ul>
      <form className="message-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="message-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message in ${chatName}...`}
        />
        <button type="submit" className="send-button">Send</button>
      </form>
    </div>
  );
};

export default ChatWindow;
