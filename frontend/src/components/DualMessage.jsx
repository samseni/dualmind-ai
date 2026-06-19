import React, { useState } from 'react';

const DualMessage = ({ role, content, claudeResponse, chatgptResponse, timestamp }) => {
  const [copiedClaude, setCopiedClaude] = useState(false);
  const [copiedChatGPT, setCopiedChatGPT] = useState(false);

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCopy = async (text, model) => {
    try {
      await navigator.clipboard.writeText(text);
      if (model === 'claude') {
        setCopiedClaude(true);
        setTimeout(() => setCopiedClaude(false), 2000);
      } else {
        setCopiedChatGPT(true);
        setTimeout(() => setCopiedChatGPT(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // User message (full width)
  if (role === 'user') {
    return (
      <div className="message user">
        <div className="message-avatar">👤</div>
        <div className="message-content-wrapper">
          <div className="message-header">
            <span className="message-role">You</span>
            {timestamp && (
              <span className="message-time">{formatTime(timestamp)}</span>
            )}
          </div>
          <div className="message-bubble">{content}</div>
        </div>
      </div>
    );
  }

  // Dual AI responses (side-by-side)
  return (
    <div className="dual-message-container">
      {/* Claude Response */}
      <div className="dual-message claude">
        <div className="message-avatar claude-avatar">C</div>
        <div className="message-content-wrapper">
          <div className="message-header">
            <span className="message-role">Claude</span>
            {timestamp && (
              <span className="message-time">{formatTime(timestamp)}</span>
            )}
          </div>
          <div className="message-bubble">
            {claudeResponse || 'Thinking...'}
          </div>
          {claudeResponse && (
            <div className="message-actions">
              <button
                onClick={() => handleCopy(claudeResponse, 'claude')}
                className="action-button"
                title="Copy message"
              >
                {copiedClaude ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ChatGPT Response */}
      <div className="dual-message chatgpt">
        <div className="message-avatar chatgpt-avatar">G</div>
        <div className="message-content-wrapper">
          <div className="message-header">
            <span className="message-role">ChatGPT</span>
            {timestamp && (
              <span className="message-time">{formatTime(timestamp)}</span>
            )}
          </div>
          <div className="message-bubble">
            {chatgptResponse || 'Thinking...'}
          </div>
          {chatgptResponse && (
            <div className="message-actions">
              <button
                onClick={() => handleCopy(chatgptResponse, 'chatgpt')}
                className="action-button"
                title="Copy message"
              >
                {copiedChatGPT ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DualMessage;