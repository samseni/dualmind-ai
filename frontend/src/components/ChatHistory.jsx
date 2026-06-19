import React, { useState } from 'react';

const ChatHistory = ({
  conversations,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isOpen,
  onToggle
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getChatTitle = (chat) => {
    if (chat.title) return chat.title;
    if (chat.messages && chat.messages.length > 0) {
      const firstMessage = chat.messages[0].content;
      return firstMessage.length > 30
        ? firstMessage.substring(0, 30) + '...'
        : firstMessage;
    }
    return 'New Chat';
  };

  const handleRename = (chatId, newTitle) => {
    // This would be handled by parent component
    setEditingId(null);
    setEditTitle('');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onToggle}></div>
      )}

      {/* Sidebar */}
      <div className={`chat-history-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Chat History</h2>
          <button className="close-sidebar-btn" onClick={onToggle}>
            ✕
          </button>
        </div>

        <button className="new-chat-btn" onClick={onNewChat}>
          <span className="new-chat-icon">✚</span>
          New Chat
        </button>

        <div className="conversations-list">
          {conversations.length === 0 ? (
            <div className="no-chats">
              <p>No saved chats yet</p>
              <p className="no-chats-hint">Start a conversation to see it here</p>
            </div>
          ) : (
            conversations.map((chat) => (
              <div
                key={chat.id}
                className={`conversation-item ${currentChatId === chat.id ? 'active' : ''}`}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="conversation-content">
                  <div className="conversation-header">
                    {editingId === chat.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => handleRename(chat.id, editTitle)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleRename(chat.id, editTitle);
                        }}
                        autoFocus
                        className="edit-title-input"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="conversation-title">
                        <span className="chat-icon">💬</span>
                        {getChatTitle(chat)}
                      </div>
                    )}
                  </div>
                  <div className="conversation-meta">
                    <span className="conversation-date">
                      {formatDate(chat.lastUpdated)}
                    </span>
                    <span className="conversation-count">
                      {chat.messages?.length || 0} messages
                    </span>
                  </div>
                </div>
                <div className="conversation-actions">
                  <button
                    className="conversation-action-btn delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    title="Delete chat"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-info">
            <span className="info-icon">ℹ️</span>
            <span className="info-text">
              Chats are saved locally in your browser
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatHistory;