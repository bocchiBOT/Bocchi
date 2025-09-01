import { Events, MessageFlags } from 'discord.js';
import logger from '../utils/logger.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction) {
        const startTime = Date.now();
        const { user, guild } = interaction;

        try {
            // Buttons
            if (interaction.isButton()) {
                const buttonId = interaction.customId;
                logger.debug(`🔘 Button pressed: ${buttonId} by ${user.tag} in ${guild?.name || 'DM'}`);

                const buttonHandler = interaction.client.buttons?.get(buttonId);
                if (!buttonHandler) {
                    return interaction.reply({ content: '❌ Botão não encontrado!', flags: [MessageFlags.Ephemeral] });
                }

                await buttonHandler.execute(interaction);

                const executionTime = Date.now() - startTime;
                logger.debug(`✅ Button ${buttonId} executed in ${executionTime}ms`);
                return;
            }

            // Select Menus (all types)
            if (
                interaction.isStringSelectMenu() ||
                interaction.isUserSelectMenu() ||
                interaction.isRoleSelectMenu() ||
                interaction.isChannelSelectMenu() ||
                interaction.isMentionableSelectMenu()
            ) {
                const menuId = interaction.customId;
                logger.debug(`📋 Select menu used: ${menuId} by ${user.tag} in ${guild?.name || 'DM'}`);

                const menuHandler = interaction.client.selectMenus?.get(menuId);
                if (!menuHandler) {
                    return interaction.reply({ content: '❌ Menu não encontrado!', flags: [MessageFlags.Ephemeral] });
                }

                await menuHandler.execute(interaction);

                const executionTime = Date.now() - startTime;
                logger.debug(`✅ Select menu ${menuId} executed in ${executionTime}ms`);
                return;
            }

            // Modals (forms)
            if (interaction.isModalSubmit()) {
                const modalId = interaction.customId;
                logger.debug(`📝 Modal submitted: ${modalId} by ${user.tag} in ${guild?.name || 'DM'}`);

                const modalHandler = interaction.client.modals?.get(modalId);
                if (!modalHandler) {
                    return interaction.reply({ content: '❌ Formulário não encontrado!', flags: [MessageFlags.Ephemeral] });
                }

                await modalHandler.execute(interaction);

                const executionTime = Date.now() - startTime;
                logger.debug(`✅ Modal ${modalId} executed in ${executionTime}ms`);
                return;
            }

            // Context Menu Commands
            if (interaction.isUserContextMenuCommand() || interaction.isMessageContextMenuCommand()) {
                const commandName = interaction.commandName;
                logger.debug(`📜 Context menu command used: ${commandName} by ${user.tag} in ${guild?.name || 'DM'}`);

                const command = interaction.client.contextMenus?.get(commandName);
                if (!command) {
                    return interaction.reply({ content: '❌ Comando de contexto não encontrado!', flags: [MessageFlags.Ephemeral] });
                }

                await command.execute(interaction);

                const executionTime = Date.now() - startTime;
                logger.debug(`✅ Context menu ${commandName} executed in ${executionTime}ms`);
                return;
            }

        } catch (error) {
            const executionTime = Date.now() - startTime;
            logger.error(`💥 Error processing interaction:`, error.stack);
            logger.error(`⏱️ Time until error: ${executionTime}ms`);

            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: '❌ Erro ao processar interação!', flags: [MessageFlags.Ephemeral] });
                } else {
                    await interaction.reply({ content: '❌ Erro ao processar interação!', flags: [MessageFlags.Ephemeral] });
                }
            } catch (replyError) {
                logger.error('❌ Failed to send error message:', replyError);
            }
        }
    }
};
