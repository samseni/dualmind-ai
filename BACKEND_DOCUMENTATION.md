# 🔧 Backend Documentation - DualMind AI

This document explains the complete backend implementation of DualMind AI, including every file, how they work together, and how to use them.

---

## 📁 Backend Structure

```
backend/
├── .env                    # Environment variables (API key)
├── .gitignore             # Git ignore rules
├── package.json           # Node.js dependencies
├── server.js              # Express server entry point
├── routes/
│   └── chat.js           # Chat API endpoint
└── services/
    ├── groq.js           # Llama 3.3 70B integration (large model)
    └── mixtral.js        # Llama 3.1 8B integration (fast model)
```

---

## 🤖 AI Models Used

| Model | Size | Speed | Provider | Cost | Best For |
|-------|------|-------|----------|------|----------|
| **Llama 3.3 70B** | 70B params | Moderate | Meta via Groq | **FREE** | Detailed answers, complex reasoning |
| **Llama 3.1 8B Instant** | 8B params | Very Fast | Meta via Groq | **FREE** | Quick responses, simple questions |

**Key Point:** Both models use the **same Groq API key** - completely FREE with generous rate limits!

---

## 🗂️ File-by-File Breakdown

### 1. **server.js** - Express Server Entry Point

**Purpose:** Main server file that starts the Express application and configures middleware.

**What it does:**
- Loads environment variables from `.env` file **FIRST** (critical for API keys)
- Creates Express app instance
- Configures CORS to allow frontend (localhost:5173) to communicate
- Enables JSON body parsing for API requests
- Mounts the chat route at `/api/chat`
- Provides health check endpoint at `/health`
- Starts server on port 5000 (or PORT from .env)

**Key Code:**
```javascript
// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const chatRoute = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 5000;

// Allow frontend to call this backend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());  // Parse JSON request bodies

// Mount chat route
app.use('/api/chat', chatRoute);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
```

**Environment Variables Used:**
- `PORT` - Server port (default: 5000)

**Important:** Environment variables are loaded at the very top to ensure API keys are available before any services are imported.

---

### 2. **routes/chat.js** - Chat API Endpoint

**Purpose:** Handles POST requests to `/api/chat`, orchestrates calls to both AI models.

**What it does:**
- Accepts user messages and conversation history from frontend
- Validates the request payload
- Calls both Llama models **in parallel** using `Promise.allSettled()`
- Returns both AI responses in a single JSON object
- Handles partial failures gracefully (if one model fails, the other still works)

**API Endpoint:**

**POST `/api/chat`**

**Request Body:**
```json
{
  "message": "What is React?",
  "conversationHistory": [
    { "role": "user", "content": "Hello!" },
    { "role": "assistant", "content": "Hi! How can I help?" }
  ]
}
```

**Response (Success):**
```json
{
  "claudeReply": "React is a JavaScript library created by Facebook...",
  "chatgptReply": "React is a popular JavaScript library for building UIs..."
}
```

**Note:** Response keys are `claudeReply` and `chatgptReply` for frontend compatibility, but they actually contain Llama 3.3 70B and Llama 3.1 8B responses respectively.

**Error Response (400 - Bad Request):**
```json
{
  "error": "Message is required and must be a string"
}
```

**Error Response (500 - Server Error):**
```json
{
  "error": "Failed to get AI responses",
  "details": "API key is invalid"
}
```

**Key Code:**
```javascript
const express = require('express');
const router = express.Router();
const { callGroq } = require('../services/groq');
const { callMixtral } = require('../services/mixtral');

router.post('/', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required...' });
    }

    // Call both AI models in parallel (allow partial failures)
    const results = await Promise.allSettled([
      callGroq(message, conversationHistory || []),
      callMixtral(message, conversationHistory || [])
    ]);

    // Extract responses or error messages
    const llamaReply = results[0].status === 'fulfilled'
      ? results[0].value
      : `Error: ${results[0].reason.message}`;

    const mixtralReply = results[1].status === 'fulfilled'
      ? results[1].value
      : `Error: ${results[1].reason.message}`;

    // Return both responses
    res.json({
      claudeReply: llamaReply,      // Groq - Llama 3.3 70B
      chatgptReply: mixtralReply    // Groq - Llama 3.1 8B
    });

  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      error: 'Failed to get AI responses',
      details: error.message
    });
  }
});

module.exports = router;
```

**Why Parallel Calls?**
- Instead of waiting for Llama 3.3 → then Llama 3.1 (2x time)
- Both run simultaneously, response time = slowest of the two
- Uses `Promise.allSettled()` to execute both API calls at the same time

**Why Promise.allSettled vs Promise.all?**
- `Promise.allSettled()` - If one model fails, the other still returns
- `Promise.all()` - If one fails, both fail
- Better user experience: partial results are better than total failure

---

### 3. **services/groq.js** - Llama 3.3 70B Integration

**Purpose:** Handles communication with Groq API for Llama 3.3 70B (large model).

**What it does:**
- Initializes Groq SDK client with API key from environment
- Exports `callGroq()` function that accepts message + conversation history
- Formats conversation history into Groq's expected message format
- Calls Groq API with the `llama-3.3-70b-versatile` model
- Extracts and returns the text response
- Handles API errors

**Model Used:**
- `llama-3.3-70b-versatile` - Latest Llama 3.3 70B model
- Max tokens: 1024
- Temperature: 0.7 (balanced creativity)

**Key Code:**
```javascript
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function callGroq(message, conversationHistory = []) {
  try {
    // Build messages array
    const messages = [
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Call Groq API
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: messages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    // Extract reply
    return response.choices[0].message.content;

  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw new Error(`Groq API error: ${error.message}`);
  }
}

module.exports = { callGroq };
```

**Message Format:**
```javascript
[
  { role: 'user', content: 'Hello!' },
  { role: 'assistant', content: 'Hi there!' },
  { role: 'user', content: 'How are you?' }
]
```

**Environment Variables Used:**
- `GROQ_API_KEY` - Your Groq API key (required)

---

### 4. **services/mixtral.js** - Llama 3.1 8B Integration

**Purpose:** Handles communication with Groq API for Llama 3.1 8B Instant (fast model).

**What it does:**
- Initializes Groq SDK client with API key from environment (same key as groq.js)
- Exports `callMixtral()` function that accepts message + conversation history
- Formats conversation history into Groq's expected message format
- Calls Groq API with the `llama-3.1-8b-instant` model
- Extracts and returns the text response
- Handles API errors

**Note:** Despite the filename "mixtral.js", this service uses **Llama 3.1 8B Instant**. The filename is kept for backward compatibility with the routing code.

**Model Used:**
- `llama-3.1-8b-instant` - Fast, efficient Llama 3.1 8B model
- Max tokens: 1024
- Temperature: 0.7 (balanced creativity)

**Key Code:**
```javascript
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function callMixtral(message, conversationHistory = []) {
  try {
    // Build messages array
    const messages = [
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Call Groq API (using Llama 3.1 8B - fast and free!)
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: messages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    // Extract reply
    return response.choices[0].message.content;

  } catch (error) {
    console.error('Error calling Llama 3.1 8B via Groq:', error);
    throw new Error(`Llama 3.1 8B error: ${error.message}`);
  }
}

module.exports = { callMixtral };
```

**Message Format:**
```javascript
[
  { role: 'user', content: 'Hello!' },
  { role: 'assistant', content: 'Hi there!' },
  { role: 'user', content: 'How are you?' }
]
```

**Environment Variables Used:**
- `GROQ_API_KEY` - Your Groq API key (same as groq.js)

---

### 5. **.env** - Environment Variables

**Purpose:** Stores sensitive API key and configuration (never committed to git).

**Contents:**
```env
# Groq API Key (Powers BOTH AIs - completely FREE!)
# - Llama 3.3 70B (left side)
# - Mixtral 8x7B (right side)
GROQ_API_KEY=your-groq-api-key-here

# Server port
PORT=5000
```

**How to get Groq API key:**

1. **Groq:**
   - Visit: https://console.groq.com
   - Sign up with email or Google
   - Go to API Keys section
   - Create new key
   - Copy and paste into `.env`

**Security:**
- ⚠️ **NEVER commit this file to git**
- Listed in `.gitignore` to prevent accidental commits
- If exposed, immediately delete and regenerate the key

---

### 6. **package.json** - Node.js Dependencies

**Purpose:** Defines project metadata and dependencies.

**Dependencies:**
```json
{
  "dependencies": {
    "express": "^4.x.x",      // Web server framework
    "cors": "^2.x.x",          // Cross-Origin Resource Sharing
    "dotenv": "^16.x.x",       // Load .env variables
    "groq-sdk": "^0.x.x"       // Groq API SDK (for both models)
  }
}
```

**Install Command:**
```bash
npm install express cors dotenv groq-sdk
```

**Scripts:**
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

---

### 7. **.gitignore** - Git Ignore Rules

**Purpose:** Tells git which files to never track or commit.

**Contents:**
```gitignore
node_modules/   # All npm packages (reinstall with npm install)
.env            # Secret API key (NEVER commit)
.DS_Store       # macOS system files
*.log           # Log files
```

---

## 🔄 How Everything Works Together

### Request Flow:

```
1. User types message in frontend (React)
   ↓
2. ChatBox.jsx sends POST request to http://localhost:5000/api/chat
   {
     message: "What is AI?",
     conversationHistory: [...]
   }
   ↓
3. server.js receives request via Express
   ↓
4. routes/chat.js handles the request
   ↓
5. Calls both services in parallel:
   ├─ services/groq.js → Groq API → Llama 3.3 70B reply
   └─ services/mixtral.js → Groq API → Llama 3.1 8B reply
   ↓
6. routes/chat.js combines both replies
   {
     claudeReply: "AI is artificial intelligence...",
     chatgptReply: "AI stands for artificial intelligence..."
   }
   ↓
7. Response sent back to frontend
   ↓
8. DualMessage.jsx displays both responses side-by-side
```

---

## 🚀 How to Run the Backend

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure API Key
Edit `backend/.env` and add your Groq API key:
```env
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
PORT=5000
```

### 3. Start the Server
```bash
node server.js
```

**Expected Output:**
```
◇ injected env (2) from .env
Server running on http://localhost:5000
```

### 4. Test with curl (Optional)
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello!",
    "conversationHistory": []
  }'
```

**Expected Response:**
```json
{
  "claudeReply": "Hello! How can I assist you today?",
  "chatgptReply": "Hi there! How can I help you?"
}
```

---

## 🧪 Testing with Postman

### Test POST /api/chat

**URL:** `http://localhost:5000/api/chat`
**Method:** `POST`
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "message": "Explain quantum computing",
  "conversationHistory": [
    { "role": "user", "content": "Hi" },
    { "role": "assistant", "content": "Hello! How can I help?" }
  ]
}
```

**Expected 200 Response:**
```json
{
  "claudeReply": "Quantum computing is a type of computing that uses quantum mechanics...",
  "chatgptReply": "Quantum computing uses quantum bits or qubits..."
}
```

---

## 🔒 Security Best Practices

1. **Never commit `.env`** - API key is a secret
2. **Use environment variables** - Never hardcode API keys in code
3. **CORS protection** - Only allow your frontend domain
4. **Input validation** - Check message exists and is a string
5. **Error handling** - Don't expose internal errors to frontend
6. **Rate limiting** (future) - Prevent abuse of your API

---

## 🐛 Common Issues & Solutions

### Issue: "Server running" but API calls fail
**Solution:** Check that Groq API key in `.env` is correct and valid.

### Issue: CORS error in browser console
**Solution:** Verify frontend is running on `http://localhost:5173` or update CORS origin in `server.js`.

### Issue: "Cannot find module 'express'"
**Solution:** Run `npm install` in the backend directory.

### Issue: "GROQ_API_KEY is not set"
**Solution:** Create `.env` file in backend directory with your Groq API key.

### Issue: Both models return errors
**Solution:**
- Check Groq API key validity
- Verify internet connection
- Check Groq service status: https://status.groq.com

### Issue: Model decommissioned error
**Solution:** Update model names in `groq.js` and `mixtral.js` to latest versions from https://console.groq.com/docs/models

---

## 📊 API Endpoints Summary

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/health` | GET | Health check (returns `{status: 'ok'}`) | None |
| `/api/chat` | POST | Send message, get dual AI responses | Groq API key in backend |

---

## 💰 API Costs (FREE!)

**Groq Free Tier:**
- **Llama 3.3 70B:** FREE with rate limits
- **Llama 3.1 8B:** FREE with rate limits
- **Rate Limits:**
  - 30 requests per minute
  - 14,400 requests per day
  - 6,000 tokens per minute

**Total cost for development:** $0.00

Perfect for:
- Learning and development
- Portfolio projects
- Small-scale applications
- Prototyping

---

## 🔮 Future Enhancements

**Planned Features:**
- [ ] Streaming responses (Server-Sent Events)
- [ ] Database integration (PostgreSQL/SQLite) to save conversations
- [ ] Rate limiting to prevent abuse
- [ ] User authentication (JWT)
- [ ] Request logging and analytics
- [ ] Model selection endpoint (let user choose models)
- [ ] Retry logic for failed API calls
- [ ] Response caching for identical questions

---

## 📚 Dependencies Explained

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^4.x | Minimal web framework for Node.js |
| `cors` | ^2.x | Enable Cross-Origin requests from frontend |
| `dotenv` | ^16.x | Load environment variables from `.env` |
| `groq-sdk` | ^0.x | Official Groq SDK for accessing Llama models |

---

## 🎯 Key Takeaways

1. **100% Free:** Both AI models are completely free via Groq
2. **One API Key:** Single Groq key powers both models
3. **Parallel Processing:** Both AI calls happen simultaneously
4. **Conversation Memory:** Full history sent with each request
5. **Error Handling:** Graceful failures with helpful error messages
6. **Professional Architecture:** Separation of concerns (routes, services, config)
7. **Fast Responses:** Groq's infrastructure provides lightning-fast inference

---

## 📞 Support

- **Groq Docs:** https://console.groq.com/docs
- **Groq Status:** https://status.groq.com
- **Groq Discord:** https://groq.com/discord

---

## 🔄 Model Comparison

| Feature | Llama 3.3 70B | Llama 3.1 8B Instant |
|---------|---------------|----------------------|
| **Parameters** | 70 billion | 8 billion |
| **Speed** | Moderate | Very Fast |
| **Quality** | High | Good |
| **Context Window** | 8K tokens | 128K tokens |
| **Best For** | Complex tasks | Quick answers |
| **Response Detail** | Very detailed | Concise |
| **Reasoning** | Strong | Basic |

---

Built with ❤️ using free, open-source AI models powered by Groq.