# Voice Assistance Application

A modern voice visualization and assistance application with a React frontend and Node.js backend.

## 🏗️ Project Structure

```
voice-assistance/
├── frontend/                 # React + Vite frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── config/          # Configuration constants
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Helper functions
│   │   ├── styles/          # CSS files
│   │   ├── App.jsx          # Main application component
│   │   └── main.jsx         # Application entry point
│   ├── public/              # Static assets
│   ├── index.html           # HTML template
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Vite configuration
│
├── backend/                 # Node.js Express backend
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic layer
│   │   ├── middleware/      # Custom middleware
│   │   ├── config/          # Backend configuration
│   │   ├── models/          # Data models (future use)
│   │   └── server.js        # Server entry point
│   ├── package.json         # Backend dependencies
│   └── .env.example         # Environment variables template
│
├── shared/                  # Shared code between frontend/backend
│   └── constants/           # Shared constants
│
├── docs/                    # Documentation
│   ├── API.md              # API documentation
│   ├── SETUP.md            # Setup instructions
│   └── ARCHITECTURE.md     # Architecture overview
│
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## ✨ Features

### Current Features
- **Real-time Voice Visualization**: Beautiful 3D particle visualization using Three.js
- **Audio Analysis**: Real-time frequency analysis of microphone input
- **Dynamic Glow Effects**: Responsive background glows that react to voice
- **Modular Architecture**: Clean separation of concerns with custom hooks and utilities
- **AI Speech Recognition**: OpenAI Whisper integration for speech-to-text
- **Multi-language Support**: 99+ languages supported via Whisper

### Planned Features
- Voice command processing
- Real-time transcription display
- Custom voice commands
- Data persistence

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

The backend will be available at `http://localhost:3001`

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **Three.js** - 3D visualization
- **Tailwind CSS** - Styling
- **Web Audio API** - Microphone access and frequency analysis

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Python 3.11** - AI service runtime
- **OpenAI Whisper** - Speech recognition
- **PyTorch** - ML framework for Whisper
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📖 Documentation

See the `docs/` directory for detailed documentation:
- [Setup Guide](./docs/SETUP.md) - Detailed setup instructions
- [API Documentation](./docs/API.md) - Backend API endpoints
- [Architecture](./docs/ARCHITECTURE.md) - System architecture details
- [Whisper Integration](./docs/WHISPER_INTEGRATION.md) - AI speech recognition setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🙋 Support

For issues and questions, please open an issue on the GitHub repository.
