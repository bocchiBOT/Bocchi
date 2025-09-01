import { GatewayIntentBits, Options} from 'discord.js';

const config = {

    // Discord client settings
    clientOptions: {
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildModeration,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.MessageContent,
        ],
        gateway: {
            version:'10',                      // API discord version
            shards: 'auto',                    // Shards (This is only used if the bot reaches 2,500+ guilds)
            connectionTimeout: 30000,          // Maximum time to establish the TCP connection 
            handshakeTimeout: 30000,           // Maximum time to complete the WebSocket handshake after the TCP connection is established.
            autoReconnect: true,               // Auto-reconnect
            reconnectDelay: {
                max: 60000,                    // Maximum delay
                initial: 1000                  // Initial delay
            }
        },
        rest: {
            timeout: 30000,                     // Time for wait for an API response
            retries: 3,                         // Number of automatic retries if a request fails
            globalRequestsPerSecond: null       // Global request limit (null = Let discord.js manage automatically)
        },
        compress: true,                         // zlib-stream compression for WebSocket messages


         // Cache config (undefined = Discord.js default || 0 = cache disabled)
        makeCache: Options.cacheWithLimits({
            // GLOBAL MANAGERS:
            ApplicationCommandManager: undefined,     // Application Commands
            ChannelManager: undefined,                // Channels
            GuildManager: undefined,                  // Guilds
            UserManager: undefined,                   // Users

            // GUILD MANAGERS:
            GuildBanManager: undefined,               // Bans
            GuildChannelManager: undefined,           // Guild Channels
            GuildEmojiManager: 0,                     // Guild Emojis
            GuildInviteManager: undefined,            // Invites
            GuildMemberManager: undefined,            // Members
            GuildScheduledEventManager: 0,            // Scheduled Events
            GuildStickerManager: 0,                   // Stickers
            RoleManager: undefined,                   // Roles
            StageInstanceManager: 0,                  // Stage Instances
            VoiceStateManager: undefined,             // Voice States

            // MESSAGE MANAGERS:
            MessageManager: 200,                      // Messages - DEFAULT LIMIT: 200

            // REACTION MANAGERS:
            ReactionManager: undefined,               // Reactions
            ReactionUserManager: undefined,           // Reaction Users

            // THREAD MANAGERS:
            ThreadManager: 0,                         // Threads
            ThreadMemberManager: 0,                   // Thread Members

            // PRESENCE MANAGERS:
            PresenceManager: 0                        // Presences
        }),
    },

    // Default Prefix
    prefix: process.env.BOT_PREFIX || '!',


    // Slash command settings
    commands: {
        token: process.env.BOT_TOKEN,
        clientID: process.env.BOT_ID,
        guildID: process.env.GUILD_ID,
        // Deploy settings
        deploy: {
            guild: true,      // Dev, slash commands will only load in the guild with the ID defined in the .env file.
            global: false     // Release, slash commands will be registered globally (in all guilds). This may take a little while.
        }
    },

    // MongoDB Database settings
    MongoClientOptions: {
        mongoURI: process.env.MONGO_URI,
        dbName: process.env.DB_NAME,
        options: {
            maxPoolSize: 25,           // Maximum simultaneous connections
            minPoolSize: 5,            // Minimum maintained connections
            maxIdleTimeMS: 300000,     // Maximum time a connection can remain idle
            connectTimeoutMS: 15000,   // Connection establishment timeout
            socketTimeoutMS: 60000,    // Maximum duration an operation can take
            
            // Performance settings
            retryWrites: true,
            retryReads: true,
            
            // security settings
            tls: true, // Highly recommended NOT to disable this
            tlsAllowInvalidCertificates: false,
            tlsAllowInvalidHostnames: false,
        },
    },

    // Logs config
    logger: {
        level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
        colors: {
            error: '\x1b[31m',   // Red
            warn: '\x1b[33m',    // Yellow
            info: '\x1b[36m',    // Cyan
            debug: '\x1b[35m',   // Magenta
            success: '\x1b[32m', // Green
            reset: '\x1b[0m'     // Reset
        }
    },
}

export default config;
