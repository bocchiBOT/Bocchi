import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('🏓 Mostra a latência do bot e status da conexão');

export async function execute(interaction) {
    try {
        // Send initial message
        const sent = await interaction.reply({ 
            content: '🏓 Calculando ping...', 
            flags: [MessageFlags.Ephemeral],
            fetchReply: true
        });

        const roundTripLatency = sent.createdTimestamp - interaction.createdTimestamp;
        let wsLatency = interaction.client.ws.ping;

        const createEmbed = (wsLatency) => {
            const displayWsPing = wsLatency === -1 ? "🔁 Inicializando..." : `${wsLatency}ms`;
            
            let status, statusEmoji;
            if (wsLatency === -1) {
                status = 'Coletando dados';
                statusEmoji = '⏳';
            } else if (wsLatency <= 100) {
                status = 'Excelente';
                statusEmoji = '🟢';
            } else if (wsLatency <= 200) {
                status = 'Bom';
                statusEmoji = '🟡';
            } else if (wsLatency <= 500) {
                status = 'Regular';
                statusEmoji = '🟠';
            } else {
                status = 'Ruim';
                statusEmoji = '🔴';
            }

            return new EmbedBuilder()
                .setColor(
                    wsLatency === -1 ? 0x3498DB :
                    wsLatency <= 100 ? 0x2ECC71 :
                    wsLatency <= 200 ? 0xF1C40F :
                    wsLatency <= 500 ? 0xE67E22 :
                    0xE74C3C
                )
                .addFields(
                    { 
                        name: '⚡ API Ping:', 
                        value: `\`${roundTripLatency}ms\``, 
                        inline: false 
                    },
                    { 
                        name: '⏱️ Gateway Ping:', 
                        value: `\`${displayWsPing}\``, 
                        inline: false 
                    },
                    { 
                        name: `${statusEmoji} Status da Conexão:`, 
                        value: `**${status}**`, 
                        inline: false 
                    }
                )
                .setFooter({ 
                    text: `Shard: ${interaction.guild?.shardId ?? 0}` 
                })
                .setTimestamp();
        };

        // Edit the initial message
        await interaction.editReply({ 
            content: '**🏓 Pong!**', 
            embeds: [createEmbed(wsLatency)] 
        });

        if (wsLatency === -1) {
            const maxChecks = 6;
            let checks = 0;
            
            const checkInterval = setInterval(async () => {
                wsLatency = interaction.client.ws.ping;
                checks++;
                
                if (wsLatency !== -1 || checks >= maxChecks) {
                    clearInterval(checkInterval);
                    
                    if (wsLatency !== -1) {
                        await interaction.editReply({
                            content: '**🏓 Pong!**',
                            embeds: [createEmbed(wsLatency)]
                        });
                    }
                }
            }, 5000);
        }

    } catch (error) {
        logger.error('Erro no comando ping:', error);
        
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ 
                    content: '❌ Ocorreu um erro ao calcular o ping.', 
                    flags: [MessageFlags.Ephemeral] 
                });
            } else {
                await interaction.reply({ 
                    content: '❌ Ocorreu um erro ao calcular o ping.', 
                    flags: [MessageFlags.Ephemeral] 
                });
            }
        } catch (replyError) {
            logger.error('Erro ao enviar mensagem de erro:', replyError);
        }
    }
}
