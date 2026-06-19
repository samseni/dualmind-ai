# 🧠 DualMind AI

> A full-stack AI chat application that lets you talk to **Claude** and **ChatGPT** **simultaneously** — get responses from both AI models side-by-side for every question.

DualMind is a portfolio-worthy project that demonstrates professional AI integration skills: securely calling multiple LLMs in parallel, handling dual responses, and providing an intuitive comparison interface. This same architecture is used in production AI applications.

---

## 📌 Table of Contents

1. [What This Project Is](#what-this-project-is)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [How It Works (Architecture)](#how-it-works-architecture)
5. [Prerequisites](#prerequisites)
6. [Folder Structure](#folder-structure)
7. [Environment Variables](#environment-variables)
8. [Setup & Installation](#setup--installation)
9. [Build Order (Roadmap)](#build-order-roadmap)
10. [Putting It On GitHub](#putting-it-on-github)
11. [Future Enhancements](#future-enhancements)

---

## 📚 Documentation

- **[Frontend Documentation](FRONTEND_DOCUMENTATION.md)** - Detailed explanation of every frontend file and how they work together

---

## What This Project Is

DualMind is a chat application similar to ChatGPT or Claude's official website, with one key difference: **users get responses from BOTH AI models for every question.** The interface provides a side-by-side comparison view where you can see how Claude (Anthropic) and ChatGPT (OpenAI) each respond to the same prompt.

**Why this project matters:**
- ✅ **Professional architecture** — API keys are secured on the backend (never exposed to clients)
- ✅ **Production-ready patterns** — proper conversation handling, error management, streaming responses
- ✅ **Portfolio-worthy** — demonstrates real-world AI integration skills
- ✅ **Scalable foundation** — easily extend to add more models, features, or use cases

This is intentionally scoped to be completable while teaching the fundamental skills you'll use in any AI-powered application.

---

## Features

### 🎨 Modern UI & UX
- 🌓 **Dark/Light Mode** — Toggle between themes with preference saved to browser
- 💅 **Professional Design** — Modern, clean interface with smooth animations
- 📱 **Fully Responsive** — Works perfectly on desktop, tablet, and mobile
- ⚡ **Smooth Animations** — Messages slide in, buttons have hover effects, seamless transitions

### 💬 Chat Features
- 🔥 **Dual Mode** — Get responses from BOTH Claude and ChatGPT simultaneously
- ⚖️ **Side-by-Side Comparison** — Compare responses from both AI models in real-time
- 🎨 **Modern UI** — Clean, professional design inspired by Claude and ChatGPT interfaces
- 🧵 **Conversation Memory** — AI remembers previous messages in the chat
- 👤 **Message Avatars** — Distinct avatars for Claude (C) and ChatGPT (G)
- 🕐 **Timestamps** — See when each message was sent
- 📋 **Copy Messages** — Individual copy buttons for each AI response
- 📱 **Smart Layout** — Side-by-side on desktop, stacked on mobile
- ⚡ **Parallel Requests** — Both AIs process your question at the same time

### 🗂️ Chat History & Management
- 📚 **Sidebar Navigation** — Collapsible sidebar showing all your conversations
- 💾 **Auto-Save** — Conversations automatically saved to browser localStorage
- ✨ **New Chat** — Start fresh conversations with one click
- 🔄 **Load Previous Chats** — Click any saved chat to continue where you left off
- 🗑️ **Delete Chats** — Remove unwanted conversations
- 📅 **Smart Dates** — "Today", "Yesterday", or specific dates for chat history
- 📊 **Message Count** — See how many messages in each conversation

### 🔒 Security
- 🔐 **Secure API Handling** — Keys protected on backend, never exposed to frontend
- 🏠 **Local Storage** — All chats saved locally in your browser (privacy-first)

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React (Vite) | Build the chat UI with modern tooling |
| **Backend** | Node.js + Express | Secure API proxy, hide keys, orchestrate AI calls |
| **AI APIs** | Anthropic (Claude) + OpenAI (ChatGPT) | The actual AI language models |
| **Database** *(optional)* | PostgreSQL or SQLite | Persist conversation history |
| **Tools** | Git, GitHub, Postman | Version control + API testing |

> ⚠️ **Security Critical:** API keys must ONLY live on the backend. Never put them in frontend code — anyone can inspect your React bundle and steal exposed keys.

---

## How It Works (Architecture)

```
┌─────────────────────┐
│  React Frontend     │  User types message
│  (Browser)          │
└──────────┬──────────┘
           │ HTTP POST /api/chat
           │ { message, conversationHistory }
           ▼
┌─────────────────────┐
│  Express Backend    │  ← API keys stored here (environment variables)
│  (Node.js Server)   │  ← Calls BOTH APIs in parallel
└──────────┬──────────┘
           │
           ├─────────────────┬─────────────────┐
           ▼                 ▼                 ▼
   ┌─────────────┐   ┌─────────────┐   ┌──────────┐
   │ Claude API  │   │ OpenAI API  │   │ Database │
   │ (Anthropic) │   │  (ChatGPT)  │   │(optional)│
   └─────────────┘   └─────────────┘   └──────────┘
           │                 │
           └────────┬────────┘
                    ▼
      { claudeReply: "...", chatgptReply: "..." }
                    │
                    ▼
           ┌─────────────────┐
           │  Frontend UI    │  Displays both responses side-by-side
           └─────────────────┘
```

**Key principle:** The frontend never talks to AI APIs directly. It only communicates with *your* backend, which acts as a secure proxy to the AI providers. This architecture:
- Keeps API keys safe (never sent to browser)
- Allows rate limiting and usage tracking
- Enables request logging and monitoring
- Lets you add custom business logic before/after AI calls

---

## Prerequisites

### Accounts & API Keys
- [ ] **Anthropic API key** (for Claude) — Get from [console.anthropic.com](https://console.anthropic.com)
- [ ] **OpenAI API key** (for ChatGPT) — Get from [platform.openai.com](https://platform.openai.com)
- You can start with just **one** provider and add the second later
- Both are pay-per-use but very cheap for testing ($0.01–0.05 for typical dev testing)

### Software Installed
- [ ] [Node.js](https://nodejs.org) v18 or newer (`node --version` to check)
- [ ] [Git](https://git-scm.com) (`git --version` to check)
- [ ] A code editor ([VS Code](https://code.visualstudio.com) recommended)
- [ ] [Postman](https://www.postman.com) or similar (to test backend APIs before building UI)

### Accounts
- [ ] [GitHub](https://github.com) account (for version control and portfolio)

---

## Folder Structure

```
dualmind-ai/
├── backend/
│   ├── node_modules/         # Dependencies (ignored by git)
│   ├── routes/
│   │   └── chat.js           # POST /api/chat endpoint
│   ├── services/
│   │   ├── claude.js         # Function to call Anthropic API
│   │   └── openai.js         # Function to call OpenAI API
│   ├── .env                  # Secret API keys (NEVER commit this)
│   ├── .gitignore            # Tells git to ignore .env and node_modules
│   ├── package.json          # Backend dependencies
│   └── server.js             # Express server entry point
│
├── frontend/
│   ├── node_modules/         # Dependencies (ignored by git)
│   ├── public/
│   │   └── logos/
│   │       ├── claude.svg        # Claude brand logo (sunburst pattern)
│   │       └── chatgpt.svg       # ChatGPT brand logo (hexagonal swirl)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatBox.jsx       # Main chat interface + state management
│   │   │   ├── ChatHistory.jsx   # Sidebar with saved conversations
│   │   │   └── DualMessage.jsx   # Side-by-side AI response component
│   │   ├── App.jsx           # Main app component + theme management
│   │   ├── App.css           # All styles (dark/light themes, sidebar, etc.)
│   │   └── main.jsx          # React entry point
│   ├── index.html            # HTML entry point
│   ├── .gitignore            # Ignore node_modules, dist, etc.
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite bundler configuration
│
├── .gitignore                # Root-level git ignore
└── README.md                 # This file
```

---

## Environment Variables

Create a file named `.env` inside the `backend/` folder:

```env
# Anthropic API Key (for Claude)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# OpenAI API Key (for ChatGPT)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Server port
PORT=5000
```

> 🔒 **Security:** This file contains your secret API keys. It must be listed in `.gitignore` so it is never uploaded to GitHub. If you accidentally commit it, treat those keys as compromised — delete and regenerate them immediately.

**To get your API keys:**
- **Claude:** [console.anthropic.com](https://console.anthropic.com) → Settings → API Keys
- **ChatGPT:** [platform.openai.com/api-keys](https://platform.openai.com/api-keys) → Create new secret key

---

## Setup & Installation

### 1. Clone or Initialize the Project

```bash
# If starting fresh
mkdir dualmind-ai
cd dualmind-ai
git init

# If cloning from GitHub
git clone https://github.com/YOUR_USERNAME/dualmind-ai.git
cd dualmind-ai
```

### 2. Backend Setup

```bash
cd backend
npm install express cors dotenv @anthropic-ai/sdk openai

# Create your .env file (see "Environment Variables" section)
# Then start the server:
node server.js
```

You should see: `Server running on http://localhost:5000`

### 3. Frontend Setup

```bash
# In a new terminal
cd frontend
npm install

# Start the development server:
npm run dev
```

Open the URL shown (usually `http://localhost:5173`) to see your app.

### 4. Test the Backend (Optional but Recommended)

Before building the UI, test your backend with Postman:

**Request:**
```
POST http://localhost:5000/api/chat
Content-Type: application/json

{
  "message": "Hello, who are you?",
  "conversationHistory": []
}
```

**Expected response:**
```json
{
  "claudeReply": "Hello! I'm Claude, an AI assistant created by Anthropic...",
  "chatgptReply": "Hello! I'm ChatGPT, an AI language model developed by OpenAI..."
}
```

---

## Build Order (Roadmap)

Follow this step-by-step roadmap. Each step is a complete, testable milestone.

### Phase 1: Backend Foundation
- [ ] **Step 1.1** — Set up Express server with a basic `/api/chat` route that returns "Hello"
- [ ] **Step 1.2** — Add Anthropic SDK, call Claude with a hardcoded message, log the response
- [ ] **Step 1.3** — Accept `message` from request body, return Claude's reply as JSON
- [ ] **Step 1.4** — Test in Postman until it works reliably

### Phase 2: Basic Frontend
- [ ] **Step 2.1** — Create a React app with a text input and "Send" button
- [ ] **Step 2.2** — Send the message to your backend `/api/chat` endpoint
- [ ] **Step 2.3** — Display the AI's reply in a simple message list

### Phase 3: Conversation Memory
- [ ] **Step 3.1** — Store messages in React state as an array: `[{role: 'user', content: '...'}, ...]`
- [ ] **Step 3.2** — Send the full conversation history to the backend with each request
- [ ] **Step 3.3** — Backend passes history to Claude so it remembers context

### Phase 4: Model Switching
- [ ] **Step 4.1** — Add OpenAI SDK to backend, create `openai.js` service
- [ ] **Step 4.2** — Add a dropdown in frontend to select "Claude" or "ChatGPT"
- [ ] **Step 4.3** — Backend routes to the correct service based on `model` parameter

### Phase 5: Streaming Responses
- [ ] **Step 5.1** — Backend streams chunks using `res.write()` or Server-Sent Events
- [ ] **Step 5.2** — Frontend reads the stream and updates the message word-by-word

### Phase 6: Polish & Optional Features
- [ ] **Step 6.1** — Add a database (PostgreSQL/SQLite) to save conversations
- [ ] **Step 6.2** — Create a sidebar to list and load past chats
- [ ] **Step 6.3** — Add user authentication (optional)
- [ ] **Step 6.4** — Deploy to production (Vercel + Render/Railway)

---

## Putting It On GitHub

### 1. Create `.gitignore` Files

**Root `.gitignore`:**
```gitignore
node_modules/
.env
.DS_Store
```

**Backend `.gitignore`:**
```gitignore
node_modules/
.env
```

**Frontend `.gitignore`:**
```gitignore
node_modules/
dist/
.env
```

### 2. Initialize Git and Commit

```bash
# From the root dualmind-ai/ directory
git init
git add .
git commit -m "Initial commit: DualMind AI chat app"
```

### 3. Push to GitHub

1. Go to [GitHub](https://github.com) and create a new repository named `dualmind-ai`
2. **Do NOT** initialize it with a README (you already have one)
3. Connect and push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/dualmind-ai.git
git branch -M main
git push -u origin main
```

> ⚠️ **Before your first push:** Double-check that `.env` is in `.gitignore`. Run `git status` and confirm `.env` is NOT listed. If you ever accidentally upload an API key, delete it from both the repo history and the API provider dashboard, then regenerate new keys.

---

## Future Enhancements

Once the core app works, these make excellent portfolio additions:

**Advanced Features:**
- 🎨 **Dark mode** with theme switcher ✅ *Implemented!*
- 🔄 **Dual mode comparison** ✅ *Implemented!*
- 📎 **File uploads** for multimodal chat (images, PDFs)
- 🏷️ **Auto-generated titles** for conversations using AI
- 🔍 **Search** past conversations
- 📊 **Usage dashboard** — track API costs and token usage
- 🎚️ **Model selection toggle** — Let users choose single model vs dual mode

**Technical Improvements:**
- 👤 **User accounts** with authentication (JWT or OAuth)
- 🗄️ **Database integration** (PostgreSQL for production)
- ⚙️ **Custom system prompts** — let users define AI personality/behavior
- 🚀 **Deployment** — Vercel (frontend) + Railway/Render (backend)
- 🧪 **Tests** — Jest for backend, React Testing Library for frontend
- 📈 **Analytics** — track most-used model, average response time, etc.

**AI Capabilities:**
- 🤖 **More models** — Add GPT-4o, Gemini, Llama, etc.
- 🧠 **RAG (Retrieval-Augmented Generation)** — let AI answer from your documents
- 🔧 **Function calling** — enable AI to use tools (calculator, weather API, etc.)
- 🎭 **Personas** — predefined characters (code assistant, creative writer, tutor)

---

## Project Philosophy

**Why DualMind is structured this way:**

1. **Security first** — API keys are never exposed to the frontend
2. **Professional patterns** — This architecture scales to production AI apps
3. **Incremental complexity** — Each phase builds on the previous one
4. **Real-world skills** — Learn the same patterns used in commercial AI products
5. **Portfolio-ready** — Demonstrates full-stack + AI integration competency

**Learning outcomes:**
- ✅ Secure API key management
- ✅ Backend proxy pattern for third-party APIs
- ✅ Handling streaming responses
- ✅ Managing conversation state and context
- ✅ Error handling for AI APIs (rate limits, timeouts, etc.)
- ✅ Full-stack integration (React ↔ Express ↔ AI APIs)

---

## License

MIT — Free to use, learn from, and build upon.

---

## About

**Project:** DualMind AI
**Purpose:** Learn professional AI integration by building a production-ready chat app
**Status:** In Development
**Tech:** React + Express + Claude + ChatGPT

---

Built with ❤️ for learning and portfolio development.