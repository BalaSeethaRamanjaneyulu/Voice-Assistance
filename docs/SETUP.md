# Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **yarn**
- **Git** for version control

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Voice
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

#### Frontend Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally

### 3. Backend Setup

```bash
# Navigate to backend directory (from project root)
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

#### Environment Variables

Edit the `.env` file with your settings:

```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

#### Start Backend Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The backend will be available at `http://localhost:3001`

#### Backend Scripts
- `npm run dev` - Start development server with nodemon (auto-reload)
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

## Development Workflow

### Running Both Services

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

### Testing the Application

1. Open `http://localhost:5173` in your browser
2. Click anywhere on the screen to activate the microphone
3. Grant microphone permissions when prompted
4. Speak to see the real-time visualization
5. Backend health check: `http://localhost:3001/api/health`

## Browser Compatibility

The application requires a modern browser with support for:
- **Web Audio API**
- **WebGL** (for Three.js)
- **ES6+ JavaScript**

Recommended browsers:
- Chrome/Edge (v90+)
- Firefox (v88+)
- Safari (v14+)

## Microphone Permissions

The application requires microphone access. When prompted:
1. Click "Allow" to grant microphone permissions
2. If denied, you can reset permissions in browser settings:
   - Chrome: Settings → Privacy and security → Site Settings → Microphone
   - Firefox: Preferences → Privacy & Security → Permissions → Microphone
   - Safari: Preferences → Websites → Microphone

## Troubleshooting

### Frontend Issues

**Port 5173 already in use:**
```bash
# Kill the process using port 5173
lsof -ti:5173 | xargs kill -9

# Or change the port in vite.config.js
```

**Module not found errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Backend Issues

**Port 3001 already in use:**
```bash
# Kill the process using port 3001
lsof -ti:3001 | xargs kill -9

# Or change PORT in .env file
```

**CORS errors:**
- Ensure `CORS_ORIGIN` in backend `.env` matches your frontend URL
- Check that both servers are running

### Audio/Visualization Issues

**No visualization appearing:**
1. Check browser console for errors
2. Ensure microphone permissions are granted
3. Try refreshing the page
4. Check if WebGL is enabled in your browser

**No audio input detected:**
1. Test your microphone in system settings
2. Ensure correct microphone is selected
3. Check browser microphone permissions
4. Try using headphones with a built-in mic

## Next Steps

After successful setup:
1. Read [Architecture Documentation](./ARCHITECTURE.md)
2. Review [API Documentation](./API.md)
3. Explore the codebase structure
4. Start developing new features!

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Three.js Documentation](https://threejs.org/)
- [Express Documentation](https://expressjs.com/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
