import React, { useState } from 'react';

const Message = ({ role, content, model, timestamp }) => {
  const [copied, setCopied] = useState(false);

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`message ${role}`}>
      <div className="message-avatar">
        {role === 'user' ? '👤' : '🤖'}
      </div>

      <div className="message-content-wrapper">
        <div className="message-header">
          <span className="message-role">
            {role === 'user' ? 'You' : model || 'AI'}
          </span>
          {timestamp && (
            <span className="message-time">{formatTime(timestamp)}</span>
          )}
        </div>

        <div className="message-bubble">
          {content}
        </div>

        {role === 'assistant' && (
          <div className="message-actions">
            <button
              onClick={handleCopy}
              className="action-button"
              title="Copy message"
            >
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;