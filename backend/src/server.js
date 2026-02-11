import express from 'express';
import cors from 'cors';
import { config } from './config/config.js';

const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors({
    origin: config.corsOrigin,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development only)
if (config.nodeEnv === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// ============================================================================
// ROUTES
// ============================================================================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv
    });
});

// API Routes (to be added)
// import apiRoutes from './routes/api.js';
// app.use('/api', apiRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(config.nodeEnv === 'development' && { stack: err.stack })
    });
});

// ============================================================================
// SERVER START
// ============================================================================

const PORT = config.port;

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🎙️  Voice Assistance Backend Server                ║
║                                                       ║
║   Environment: ${config.nodeEnv.padEnd(38)}║
║   Port: ${String(PORT).padEnd(44)}║
║   URL: http://localhost:${PORT.toString().padEnd(29)}║
║                                                       ║
║   Status: ✅ Server is running                       ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);
});

export default app;
