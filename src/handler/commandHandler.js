import { readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Collection, REST, Routes } from 'discord.js';
import logger from '../utils/logger.js';
import config from '../config.js';

export async function loadCommands(client) {
    client.commands = new Collection();
    if (!client.prefixCommands) client.prefixCommands = new Collection();
    if (!client.buttons) client.buttons = new Collection();
    if (!client.selectMenus) client.selectMenus = new Collection();
    if (!client.modals) client.modals = new Collection();
    if (!client.contextMenus) client.contextMenus = new Collection();

    const commands = [];

    const __dirname = dirname(fileURLToPath(import.meta.url));
    const commandsPath = join(__dirname, '../commands');

    // Count for logger
    let slashCount = 0;
    let prefixCount = 0;

    try {
        // Recursive function to load commands
        const loadCommandsFromDir = async (dir) => {
            const items = readdirSync(dir, { withFileTypes: true });

            for (const item of items) {
                const fullPath = join(dir, item.name);

                if (item.isDirectory()) {
                    await loadCommandsFromDir(fullPath);
                } else if (item.name.endsWith('.js')) {
                    try {
                        const commandModule = await import(`file://${fullPath.replace(/\\/g, '/')}`);
                        const command = commandModule.default || commandModule;

                        if (command.data && command.execute) {
                          
                            // Slash command
                            client.commands.set(command.data.name, command);
                            commands.push(command.data.toJSON());
                            logger.debug(`✅ Command Loaded: ${command.data.name}`);
                            slashCount++;
                        
                        } else if (command.name && command.execute) {
                            // Prefix command
                            client.prefixCommands.set(command.name, command);
                            logger.debug(`✅ Command Loaded: ${command.name}`);
                            prefixCount++;
                        
                        } else {
                            // Specific warning for each type
                            if (command.data && !command.execute) {
                                logger.warn(`⚠️ Slash Command ${item.name} is missing 'execute' function`);
                            } else if (command.name && !command.execute) {
                                logger.warn(`⚠️ Prefix Command ${item.name} is missing 'execute' function`);
                            } else if (command.execute && !command.data && !command.name) {
                                logger.warn(`⚠️ Command ${item.name} is missing 'data' (slash) or 'name' (prefix)`);
                            } else {
                                logger.warn(`⚠️ Command ${item.name} has invalid structure`);
                            }
                        }
                    } catch (error) {
                        logger.error(`❌ Error loading ${item.name}: ${error.message}`);
                    }
                }
            }
        };

        // Wait the function finish
        await loadCommandsFromDir(commandsPath);

        logger.debug(`📦 Quantity of commands loaded: ${slashCount + prefixCount} || ${slashCount} Slashs || ${prefixCount} Prefix`);

        if (commands.length > 0) {
            await registerCommands(commands);
        } else {
            logger.warn('⚠️ No slash commands found to register.');
        }

    } catch (error) {
        logger.error('❌ Error loading commands:', error);
    }
}

async function registerCommands(commands) {
    const rest = new REST().setToken(config.commands.token);

    try {
        logger.info('🌐 Registering slash commands on Discord...');

        // Register Dev (Guild commands)
        if (config.commands.deploy.guild && config.commands.guildID) {
            await rest.put(
                Routes.applicationGuildCommands(config.commands.clientID, config.commands.guildID),
                { body: commands }
            );
            logger.success(`🚀 ${commands.length} slash commands registered on the server.`);
        }

        // Register Global
        if (config.commands.deploy.global) {
            await rest.put(
                Routes.applicationCommands(config.commands.clientID),
                { body: commands }
            );
            logger.success(`🌍 ${commands.length} slash commands registered globally.`);
        }

    } catch (error) {
        logger.error('❌ Failed to register slash commands:', error);
    }
}
