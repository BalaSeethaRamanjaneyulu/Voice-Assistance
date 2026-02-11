# System Architecture

## Overview

The Voice Assistance application follows a modern client-server architecture with clear separation between frontend visualization and backend processing.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT SIDE                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 React Frontend                       │  │
│  │                                                      │  │
│  │  ┌────────────┐  ┌──────────────┐  ┌────────────┐  │  │
│  │  │   App.jsx  │  │ Custom Hooks │  │   Utils    │  │  │
│  │  │ (Main UI)  │  │              │  │            │  │  │
│  │  └─────┬──────┘  └──────┬───────┘  └─────┬──────┘  │  │
│  │        │                │                 │         │  │
│  │  ┌─────▼────────────────▼─────────────────▼──────┐  │  │
│  │  │         Configuration & Constants            │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  │                                                      │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │            Three.js Visualization            │  │  │
│  │  │  - Core Particles  - Ring Particles          │  │  │
│  │  │  - Glow Effects    - Audio Analysis          │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│                          │ Web Audio API                    │
│                          ▼                                  │
│                   ┌─────────────┐                           │
│                   │ Microphone  │                           │
│                   └─────────────┘                           │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ HTTP/WebSocket (Future)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                        SERVER SIDE                          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Node.js Backend (Express)               │  │
│  │                                                      │  │
│  │  ┌──────────┐  ┌─────────────┐  ┌──────────────┐   │  │
│  │  │  Routes  │─▶│ Controllers │─▶│   Services   │   │  │
│  │  └──────────┘  └─────────────┘  └───────┬──────┘   │  │
│  │                                          │          │  │
│  │                   ┌──────────────────────▼──────┐   │  │
│  │                   │   External AI Services      │   │  │
│  │                   │  (Future Integration)       │   │  │
│  │                   └─────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Component Structure

```javascript
App.jsx (Main Component)
├── Audio Management (useAudioAnalysis hook)
│   ├── Microphone Access
│   ├── Audio Context Setup
│   └── Frequency Analysis
│
├── Three.js Scene
│   ├── Core Particle System
│   ├── Ring Particle System
│   └── Camera & Renderer
│
└── UI Elements
    ├── Status Text
    └── Background Glows (Dynamic)
```

### Data Flow

1. **User Interaction** → Click triggers microphone activation
2. **Audio Capture** → Web Audio API captures live microphone input
3. **Frequency Analysis** → Analyser node extracts frequency data
4. **Smoothing** → Values smoothed using exponential moving average
5. **Visualization** → Frequency data drives particle animations and glows
6. **Rendering** → Three.js renders 60fps visualization

### Key Technologies

- **React 18** - Modern UI library with hooks
- **Three.js** - WebGL 3D graphics library  
- **Web Audio API** - Real-time audio processing
- **Vite** - Ultra-fast build tool
- **TailwindCSS** - Utility-first CSS framework

## Backend Architecture

### Layer Structure

```
HTTP Request
    ↓
┌─────────────────┐
│   Middleware    │  - CORS, JSON parsing, logging
└────────┬────────┘
         ↓
┌─────────────────┐
│     Routes      │  - URL routing, input validation
└────────┬────────┘
         ↓
┌─────────────────┐
│  Controllers    │  - Request handling, response formatting
└────────┬────────┘
         ↓
┌─────────────────┐
│    Services     │  - Business logic, data processing
└────────┬────────┘
         ↓
┌─────────────────┐
│  External APIs  │  - Third-party integrations (future)
└─────────────────┘
```

### Design Patterns

1. **MVC Pattern** - Model-View-Controller separation
2. **Service Layer** - Business logic isolation
3. **Middleware Chain** - Request processing pipeline
4. **Error Handling** - Centralized error management

## Module Organization

### Frontend Modules

| Directory | Purpose | Examples |
|-----------|---------|----------|
| `/components` | Reusable UI components | Future: StatusBar, Controls |
| `/config` | Configuration constants | visualizationConfig.js |
| `/hooks` | Custom React hooks | useAudioAnalysis.js |
| `/utils` | Helper functions | visualizationHelpers.js |
| `/styles` | CSS files | index.css |

### Backend Modules

| Directory | Purpose | Examples |
|-----------|---------|----------|
| `/controllers` | Request handlers | audioController.js |
| `/routes` | API routes | api.js |
| `/services` | Business logic | audioService.js |
| `/middleware` | Custom middleware | auth.js (future) |
| `/config` | Configuration | config.js |
| `/models` | Data models | audioModel.js (future) |

## Configuration Management

### Frontend Configuration

All visualization parameters are centralized in `/config/visualizationConfig.js`:

- **AUDIO_CONFIG** - FFT size, smoothing, frequency ranges
- **PARTICLES_CONFIG** - Core and ring particle settings
- **ANIMATION_CONFIG** - Rotation, scaling, smoothing
- **GLOW_CONFIG** - Background glow parameters
- **CAMERA_CONFIG** - Three.js camera settings

### Backend Configuration

Environment-based configuration in `/config/config.js`:

- Server port and environment
- CORS settings
- API keys (for future integrations)
- Database connection (future)

## Scalability Considerations

### Current Architecture Benefits

1. **Modular Design** - Easy to add new features
2. **Separation of Concerns** - Clear responsibility boundaries
3. **Configuration-Driven** - Easy parameter tuning
4. **Hook-Based** - Reusable logic components
5. **Service Layer** - Business logic isolation

### Future Expansion Points

1. **WebSocket Integration** - Real-time bidirectional communication
2. **AI Service Integration** - Speech recognition, NLP
3. **Database Layer** - Data persistence
4. **Authentication** - User management
5. **File Upload** - Audio file processing
6. **Caching** - Redis for performance
7. **Message Queues** - Async processing

## Performance Optimizations

### Frontend

- **60 FPS Rendering** - RequestAnimationFrame loop
- **WebGL Acceleration** - Three.js hardware rendering
- **Smooth Animations** - Exponential smoothing
- **Direct DOM Updates** - Bypass React for glow updates
- **Memoization** - Future: useMemo, useCallback

### Backend

- **Async/Await** - Non-blocking I/O
- **Middleware Optimization** - Minimal processing chain
- **Error Handling** - Global error handler
- **Development Logging** - Conditional logging

## Security Considerations

### Current

- **CORS Configuration** - Restricted origins
- **Input Validation** - Express built-in parsers
- **Environment Variables** - Sensitive data protection

### Future

- **Rate Limiting** - API abuse prevention
- **Authentication** - JWT tokens
- **HTTPS** - Encrypted communication
- **Input Sanitization** - SQL injection prevention
- **API Key Management** - Secure storage

## Testing Strategy (Future)

### Frontend
- **Unit Tests** - Jest + React Testing Library
- **Integration Tests** - Component interactions
- **E2E Tests** - Cypress or Playwright

### Backend
- **Unit Tests** - Jest + Supertest
- **Integration Tests** - API endpoint testing
- **Load Tests** - Apache JMeter

## Deployment Architecture (Future)

```
Frontend (Static)     → Vercel / Netlify / S3 + CloudFront
Backend (Node.js)     → Heroku / AWS Elastic Beanstalk / DigitalOcean
Database (Optional)   → PostgreSQL / MongoDB Atlas
File Storage          → AWS S3
CDN                   → CloudFlare
```

## Monitoring & Logging (Future)

- **Application Monitoring** - DataDog / New Relic
- **Error Tracking** - Sentry
- **Analytics** - Google Analytics / Mixpanel
- **Logging** - Winston / Bunyan
