import 'dotenv/config';
import { Client } from 'discord.js';
import config from './src/config.js';
import logger from './src/utils/logger.js';
import { loadEvents } from './src/handler/eventHandler.js';
import { loadCommands } from './src/handler/commandHandler.js';
import { connectDB } from './src/database/mongodb.js';

// Validate required environment variables
const requiredEnvVars = ['BOT_TOKEN', 'BOT_ID'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        logger.error(`❌ Required environment variable not found: ${envVar}`);
        process.exit(1);
    }
}

const client = new Client(config.clientOptions);
client.config = config;

// Main initialization function
async function initializeBot() {
    try {
        logger.info('🚀 Starting bot...');

        // Load commands
        logger.info('⚙️ Loading commands...');
        await loadCommands(client)
        
        // Load events
        logger.info('⚡ Loading events...');
        await loadEvents(client);

        // Connect to the database
        logger.info('📊 Connecting to MongoDB...');
        await connectDB();

        // Discord login
        logger.info('🔐 Logging in to Discord...');
        await client.login(process.env.BOT_TOKEN);

    } catch (error) {
        logger.error('❌ Error during initialization:', error);
        process.exit(1);
    }
}

// Handling uncaught errors
process.on('unhandledRejection', (reason, promise) => {
    logger.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
    
    if (process.env.NODE_ENV === 'production') {
        logger.error('🔄 Restarting bot due to critical error...');
        process.exit(1);
    }
});
process.on('uncaughtException', (err) => {
    logger.error('🚨 Uncaught Exception:', err);
    logger.error('🔄 Restarting bot due to unhandled exception...');
    process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
    logger.info(`📴 Received ${signal}, Shutting down bot...`);
    if (client.isReady()) {
        client.destroy();
        logger.success('🔌 Discord client disconnected');
    }
    logger.success('👋 Bot shut down successfully');
    process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle PM2 graceful shutdown
process.on('message', (msg) => {
    if (msg === 'shutdown') {
        gracefulShutdown('PM2 shutdown');
    }
});

initializeBot();
