import React from 'react';

const Message = ({ role, content, model }) => {
  return (
    <div className={`message ${role}`}>
      <div className="message-header">
        <span className="message-role">
          {role === 'user' ? '👤 You' : `🤖 ${model || 'AI'}`}
        </span>
      </div>
      <div className="message-content">
        {content}
      </div>
    </div>
  );
};

export default Message;