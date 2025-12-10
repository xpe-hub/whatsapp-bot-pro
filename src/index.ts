import { config } from 'dotenv';
config();

import { WhatsAppBot } from './lib/WhatsAppBot';
import Database from './database/SQLiteDatabase';
import chalk from 'chalk';
import cron from 'node-cron';
import express from 'express';

// Environment variables
const BOT_NAME = process.env.NAME || 'XPE Bot';
const SESSION = process.env.SESSION || 'xpe-bot';
const PREFIX = process.env.PREFIX || '!';
const MODS = (process.env.MODS || '').split(',').map((number) => `${number}@s.whatsapp.net`).filter(Boolean);
const PORT = Number(process.env.PORT) || 4040;
const CRON = process.env.CRON;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

console.log(chalk.blue('🚀 Starting XPE Bot...'));
console.log(chalk.yellow(`📱 Bot Name: ${BOT_NAME}`));
console.log(chalk.yellow(`🔑 Session: ${SESSION}`));
console.log(chalk.yellow(`⚡ Prefix: ${PREFIX}`));
console.log(chalk.yellow(`👑 Mods: ${MODS.length} configured`));

// Initialize database
async function initializeDatabase() {
    try {
        await Database.connect('./bot.db');
        console.log(chalk.green('✅ Database connected successfully'));
    } catch (error) {
        console.error(chalk.red('❌ Database connection failed:'), error);
        process.exit(1);
    }
}

// Initialize Express server for health checks
function initializeServer() {
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
            bot: BOT_NAME,
            session: SESSION,
            prefix: PREFIX,
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        });
    });

    app.listen(PORT, () => {
        console.log(chalk.green(`🌐 Health server running on port ${PORT}`));
    });
}

// Initialize bot
async function initializeBot() {
    const bot = new WhatsAppBot({
        name: BOT_NAME,
        session: SESSION,
        prefix: PREFIX,
        mods: MODS,
        googleApiKey: GOOGLE_API_KEY,
        openaiApiKey: OPENAI_API_KEY
    });

    // Bot connection events
    bot.on('qr', (qr) => {
        console.log(chalk.blue('📱 Scan this QR code with WhatsApp:'));
        console.log(qr);
    });

    bot.on('ready', () => {
        console.log(chalk.green('✅ Bot is ready and connected to WhatsApp!'));
        console.log(chalk.yellow(`👤 Connected as: ${bot.getUserInfo()}`));
    });

    bot.on('message', (message) => {
        console.log(chalk.gray(`💬 Message from ${message.from}: ${message.body?.substring(0, 50)}...`));
    });

    // Connect to WhatsApp
    await bot.connect();
    return bot;
}

// Setup cron jobs if configured
function setupCronJobs(bot: WhatsAppBot) {
    if (CRON) {
        if (!cron.validate(CRON)) {
            console.log(chalk.red(`❌ Invalid Cron String: ${CRON}`));
            return;
        }
        
        console.log(chalk.green(`⏰ Cron job scheduled for: ${CRON}`));
        cron.schedule(CRON, async () => {
            console.log(chalk.blue('🧹 Running scheduled cleanup...'));
            // Add cleanup logic here if needed
        });
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log(chalk.yellow('\n🛑 Shutting down bot...'));
    await Database.disconnect();
    process.exit(0);
});

// Main initialization
async function main() {
    try {
        // Initialize database
        await initializeDatabase();
        
        // Initialize health server
        initializeServer();
        
        // Initialize bot
        const bot = await initializeBot();
        
        // Setup cron jobs
        setupCronJobs(bot);
        
        console.log(chalk.green('🎉 Bot initialization complete!'));
        
    } catch (error) {
        console.error(chalk.red('❌ Bot initialization failed:'), error);
        process.exit(1);
    }
}

// Start the bot
main();