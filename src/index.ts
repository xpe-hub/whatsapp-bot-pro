import { config } from 'dotenv';
config();

import express from 'express';
import { WhatsAppBot } from './lib/WhatsAppBot';

// Environment variables
const PORT = Number(process.env.PORT) || 3000;
const SESSION_NAME = process.env.SESSION_NAME || 'xpe-bot';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

console.log('🚀 Starting XPE Bot...');
console.log(`📱 Session: ${SESSION_NAME}`);
console.log(`🌐 Port: ${PORT}`);

// Initialize Express server for health checks
const app = express();

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        bot: 'running',
        timestamp: new Date().toISOString()
    });
});

app.get('/status', (req, res) => {
    res.status(200).json({ 
        status: 'active',
        bot: 'XPE Bot',
        session: SESSION_NAME,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Initialize bot
async function initializeBot() {
    try {
        console.log('🔧 Initializing WhatsApp bot...');
        
        const bot = new WhatsAppBot({
            sessionName: SESSION_NAME,
            openaiApiKey: OPENAI_API_KEY
        });

        // Initialize bot
        await bot.initialize();
        
        console.log('✅ Bot initialized successfully!');
        console.log('📱 Scan QR code to connect WhatsApp (check logs above)');
        
        return bot;
    } catch (error) {
        console.error('❌ Bot initialization failed:', error);
        throw error;
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 Shutting down bot...');
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 Shutting down bot...');
    process.exit(0);
});

// Start server and bot
async function main() {
    try {
        // Start Express server
        const server = app.listen(PORT, () => {
            console.log(`🌐 Health server running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`📈 Status: http://localhost:${PORT}/status`);
        });

        // Initialize and connect bot
        const bot = await initializeBot();

        // Handle shutdown gracefully
        const shutdown = async () => {
            console.log('🛑 Shutting down gracefully...');
            await bot.disconnect();
            server.close(() => {
                console.log('✅ Server closed');
                process.exit(0);
            });
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);

    } catch (error) {
        console.error('❌ Application startup failed:', error);
        process.exit(1);
    }
}

// Start the application
main();