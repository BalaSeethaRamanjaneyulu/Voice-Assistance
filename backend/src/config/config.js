import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

    // Add more configuration as needed
    api: {
        // openaiKey: process.env.OPENAI_API_KEY,
        // googleCloudKey: process.env.GOOGLE_CLOUD_API_KEY
    }
};
