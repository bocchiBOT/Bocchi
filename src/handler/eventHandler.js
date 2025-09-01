import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function loadEvents(client) {
    try {
        const eventsPath = join(__dirname, '../events');
        const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));
        
        let loadedCount = 0;

        for (const file of eventFiles) {
            try {
                const eventModule = await import(`file://${join(eventsPath, file).replace(/\\/g, '/')}`);
                const event = eventModule.default;

                if (!event || !event.name || !event.execute) {
                    logger.warn(`⚠️ Invalid event: ${file}`);
                    continue;
                }

                const eventName = event.name === 'ready' ? 'clientReady' : event.name;

                if (event.once) {
                    client.once(eventName, (...args) => event.execute(...args));
                } else {
                    client.on(eventName, (...args) => event.execute(...args));
                }

                logger.debug(`✅ Event loaded: ${eventName}`);
                loadedCount++;

            } catch (error) {
                logger.error(`❌ Failed to load event: ${file}:`, error);
            }
        }

        logger.debug(`📦 Quantity of events loaded: ${loadedCount}`);
        logger.success(`✅ ${loadedCount} Events loaded successfully!`);
        return loadedCount;

    } catch (error) {
        logger.error('❌ Error loading events:', error);
        console.error(error);
        return 0;
    }
}
