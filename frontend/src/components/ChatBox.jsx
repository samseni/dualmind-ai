import React, { useState, useRef, useEffect } from 'react';
import Message from './Message';
import ModelSelector from './ModelSelector';
import ChatHistory from './ChatHistory';

const ChatBox = ({ theme, toggleTheme }) => {
  // Chat history state
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentChatId, setCurrentChatId] = useState(() => {
    const saved = localStorage.getItem('currentChatId');
    return saved || null;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Current chat state
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedModel, setSelectedModel] = useState('claude');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load current chat messages
  useEffect(() => {
    if (currentChatId) {
      const currentChat = conversations.find(c => c.id === currentChatId);
      if (currentChat) {
        setMessages(currentChat.messages || []);
      }
    } else {
      setMessages([]);
    }
  }, [currentChatId, conversations]);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(conversations));
    }
  }, [conversations]);

  // Save current chat ID
  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem('currentChatId', currentChatId);
    }
  }, [currentChatId]);

  // Save current chat when messages change
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      setConversations(prev => prev.map(chat =>
        chat.id === currentChatId
          ? { ...chat, messages, lastUpdated: new Date().toISOString() }
          : chat
      ));
    }
  }, [messages, currentChatId]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Create new chat if none exists
    if (!currentChatId) {
      const newChatId = Date.now().toString();
      const newChat = {
        id: newChatId,
        title: null,
        messages: [],
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
      setConversations(prev => [newChat, ...prev]);
      setCurrentChatId(newChatId);
    }

    const userMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send message to backend
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          model: selectedModel,
          conversationHistory: messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();

      // Add AI response to chat
      const aiMessage = {
        role: 'assistant',
        content: data.reply,
        model: selectedModel === 'claude' ? 'Claude' : 'ChatGPT',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);

      // Add error message to chat
      const errorMessage = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please make sure the backend server is running.`,
        model: 'System',
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setCurrentChatId(null);
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleSelectChat = (chatId) => {
    setCurrentChatId(chatId);
    setSidebarOpen(false);
  };

  const handleDeleteChat = (chatId) => {
    setConversations(prev => prev.filter(c => c.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
      setMessages([]);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="chat-app-container">
      <ChatHistory
        conversations={conversations}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />

      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-header-left">
            <button onClick={toggleSidebar} className="sidebar-toggle">
              <span className="hamburger-icon">☰</span>
            </button>
            <div>
              <h1>🧠 DualMind AI</h1>
              <p className="subtitle">Chat with Claude & ChatGPT</p>
            </div>
          </div>
          <div className="chat-header-right">
            <button onClick={toggleTheme} className="theme-toggle">
              <span className="theme-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>

        <div className="chat-controls">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
          <button onClick={clearChat} className="clear-button">
            Clear Chat
          </button>
        </div>

        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="welcome-message">
              <h2>Welcome to DualMind! 👋</h2>
              <p>Select an AI model and start chatting.</p>
              <ul>
                <li>💬 Your conversation history is automatically saved</li>
                <li>🔀 Switch models anytime</li>
                <li>⚡ Responses appear in real-time</li>
                <li>📝 Access past chats from the sidebar</li>
              </ul>
            </div>
          ) : (
            messages.map((msg, index) => (
              <Message
                key={index}
                role={msg.role}
                content={msg.content}
                model={msg.model}
                timestamp={msg.timestamp}
              />
            ))
          )}
          {isLoading && (
            <div className="message assistant loading">
              <div className="message-avatar">🤖</div>
              <div className="message-content-wrapper">
                <div className="message-header">
                  <span className="message-role">
                    {selectedModel === 'claude' ? 'Claude' : 'ChatGPT'}
                  </span>
                </div>
                <div className="message-bubble">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here... (Press Enter to send)"
            disabled={isLoading}
            rows="3"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="send-button"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;