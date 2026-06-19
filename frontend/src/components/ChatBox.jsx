import React, { useState, useRef, useEffect } from 'react';
import DualMessage from './DualMessage';
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

    const userQuestion = inputValue;

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
      content: userQuestion,
      timestamp: new Date().toISOString(),
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);

    // Add placeholder for dual AI response
    const aiPlaceholder = {
      role: 'assistant',
      claudeResponse: null,
      chatgptResponse: null,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, aiPlaceholder]);

    setInputValue('');
    setIsLoading(true);

    try {
      // Format conversation history for backend (remove timestamps and assistant responses)
      const formattedHistory = messages
        .filter(msg => msg.role === 'user' || (msg.role === 'assistant' && msg.claudeResponse))
        .map(msg => {
          if (msg.role === 'user') {
            return { role: 'user', content: msg.content };
          } else {
            // Use Claude's response as the assistant reply
            return { role: 'assistant', content: msg.claudeResponse };
          }
        });

      // Send message to backend (will call both APIs)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userQuestion,
          conversationHistory: formattedHistory,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();

      // Update the placeholder with actual responses
      setMessages(prev => prev.map((msg, index) =>
        index === prev.length - 1
          ? {
              ...msg,
              claudeResponse: data.claudeReply || 'Error getting response',
              chatgptResponse: data.chatgptReply || 'Error getting response',
            }
          : msg
      ));
    } catch (error) {
      console.error('Error:', error);

      // Update placeholder with error message
      setMessages(prev => prev.map((msg, index) =>
        index === prev.length - 1
          ? {
              ...msg,
              claudeResponse: `Error: ${error.message}`,
              chatgptResponse: `Error: ${error.message}`,
            }
          : msg
      ));
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
              <p className="subtitle">Dual AI Models - Powered by Groq</p>
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
          <div className="dual-mode-label">
            <span className="dual-badge">🔥 Dual Mode</span>
            <span className="dual-desc">Llama 3.3 70B & Llama 3.1 8B side-by-side</span>
          </div>
          <button onClick={clearChat} className="clear-button">
            Clear Chat
          </button>
        </div>

        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="welcome-message">
              <h2>Welcome to DualMind! 👋</h2>
              <p>Chat with powerful AI models. Click a prompt below or type your own question.</p>

              <div className="prompt-cards">
                <div className="prompt-card" onClick={() => setInputValue("Explain quantum computing in simple terms")}>
                  <span className="prompt-card-icon">🔬</span>
                  <div className="prompt-card-title">Explain a concept</div>
                  <div className="prompt-card-text">Quantum computing in simple terms</div>
                </div>

                <div className="prompt-card" onClick={() => setInputValue("Write a Python function to check if a number is prime")}>
                  <span className="prompt-card-icon">💻</span>
                  <div className="prompt-card-title">Write code</div>
                  <div className="prompt-card-text">Python function to check prime numbers</div>
                </div>

                <div className="prompt-card" onClick={() => setInputValue("Help me brainstorm ideas for a mobile app")}>
                  <span className="prompt-card-icon">💡</span>
                  <div className="prompt-card-title">Brainstorm ideas</div>
                  <div className="prompt-card-text">Mobile app concepts and features</div>
                </div>

                <div className="prompt-card" onClick={() => setInputValue("Suggest a healthy meal plan for the week")}>
                  <span className="prompt-card-icon">🥗</span>
                  <div className="prompt-card-title">Get suggestions</div>
                  <div className="prompt-card-text">Healthy weekly meal plan</div>
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <DualMessage
                key={index}
                role={msg.role}
                content={msg.content}
                claudeResponse={msg.claudeResponse}
                chatgptResponse={msg.chatgptResponse}
                timestamp={msg.timestamp}
              />
            ))
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