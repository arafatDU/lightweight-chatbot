# Lightweight Chatbot

A lightweight chatbot application with FastAPI backend and modern chat UI.

## Architecture

```
├── backend/          # FastAPI backend
└── frontend/         # Chat interface (future)
```

## Backend

### Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL
- **Authentication**: JWT-based user authentication
- **AI Integration**: LLM chat model integration (configurable provider)

### Features

- **Authentication System**
  - User registration and login
  - JWT token-based authentication
  - Secure password hashing

- **Chat History**
  - Persistent chat message storage in PostgreSQL
  - User-specific conversation history
  - Message metadata (timestamps, metadata)

- **AI Chat Integration**
  - Integration with LLM APIs for chat completions
  - Streaming responses for real-time chat experience
  - Configurable model parameters

### Running the Backend

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

### Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/chatbot
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-api-key  # or other LLM provider
```

## Frontend

### Tech Stack

- Modern chat interface UI
- Real-time communication with backend
- Message streaming support

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Chat
- `POST /chat/message` - Send a chat message
- `GET /chat/history` - Get chat history
- `GET /chat/history/{session_id}` - Get specific conversation
- `DELETE /chat/history/{session_id}` - Delete a conversation

## License

MIT