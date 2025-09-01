import { Events } from 'discord.js';
import logger from '../utils/logger.js';
import config from '../config.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export default {
  name: Events.MessageCreate,
  async execute(message) {
    const prefix = config.prefix;

    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    // Ignore repeated prefix: "!!", "!!!", etc.
    const repeatedPrefixRe = new RegExp(`^(${escapeRegex(prefix)}){2,}`);
    if (repeatedPrefixRe.test(message.content)) return;

    // Ignore if after prefix comes space or nothing: "! ". 
    const after = message.content.slice(prefix.length);
    if (after.length === 0 || /^\s/.test(after)) return;

    // Parse command and args (already ensured it's "!<command>")
    const parts = after.trim().split(/\s+/);
    const commandName = parts.shift().toLowerCase();
    const args = parts;

    logger.debug(`🔧 ${message.author.tag} used ${prefix}${commandName} in ${message.guild?.name || "DM"}`);

    const startTime = Date.now();

    try {
      const command = message.client.prefixCommands?.get(commandName);
      if (!command) {
        logger.warn(`❌ Prefix command not found: ${commandName}`);
        return message.reply("❌ Comando não encontrado!");
      }

      await command.execute(message, args);

      const executionTime = Date.now() - startTime;
      logger.debug(`✅ ${prefix}${commandName} executed in ${executionTime}ms`);
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error(`💥 Error in ${prefix}${commandName}:`, error.stack);
      logger.error(`⏱️ Time until error: ${executionTime}ms`);

      try {
        await message.reply("❌ Erro ao executar comando!");
      } catch (replyError) {
        logger.error("❌ Failed to send error message:", replyError);
      }
    }
  }
};
