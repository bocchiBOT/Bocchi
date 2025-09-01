import { SlashCommandBuilder, EmbedBuilder, MessageFlags, time} from 'discord.js';
import logger from '../utils/logger.js';

export const data = new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('❔ Mostra informações sobre um usuário')
    .addUserOption(option =>
        option
            .setName('usuário')
            .setDescription('👤 Usuário para mostrar informações')
            .setRequired(false)
    );

export async function execute(interaction) {
    try {
        const member = interaction.options.getMember('usuário') || interaction.member;
        const user = member.user;

        // Datas
        const createdAt = user.createdAt;
        const joinedAt = member.joinedAt;

        // Função de diferença no formato customizado
        const formatTimeDifference = (date) => {
            const now = new Date();
            const diffMs = now - date;
            const diffSec = Math.floor(diffMs / 1000);
            const diffMin = Math.floor(diffSec / 60);
            const diffHours = Math.floor(diffMin / 60);
            const diffDays = Math.floor(diffHours / 24);

            const years = Math.floor(diffDays / 365);
            const months = Math.floor((diffDays % 365) / 30);
            const days = diffDays % 30;
            const hours = diffHours % 24;
            const minutes = diffMin % 60;

            if (years > 0) return `há ${years} ano${years > 1 ? 's' : ''}`;
            if (months > 0) return `há ${months} mês${months > 1 ? 'es' : ''}`;
            if (days > 0) return `há ${days} dia${days > 1 ? 's' : ''}`;
            if (hours > 0) return `há ${hours} hora${hours > 1 ? 's' : ''}`;
            if (minutes > 0) return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
            return 'agora mesmo';
        };

        const embed = new EmbedBuilder()
            .setColor(member.displayColor || 0x3498DB)
            .setAuthor({ name: `${member.displayName}`, iconURL: user.displayAvatarURL({ size: 256 }) })
            .setThumbnail(user.displayAvatarURL({ size: 512 }))
            .addFields(
                { name: '🆔 ID:', value: `\`${user.id}\``, inline: true },
                { name: '🏷️ Tag:', value: `\`${user.tag}\``, inline: true },
                { name: '📅 Conta criada em:', value: `${time(createdAt, 'f')} (${formatTimeDifference(createdAt)})`, inline: false },
                { name: '🚪 Entrou no servidor em:', value: joinedAt ? `${time(joinedAt, 'f')} (${formatTimeDifference(joinedAt)})` : '❌ Não disponível', inline: false },
                { name: '⬆ Maior cargo:', value: member.roles.highest?.id !== interaction.guild.id ? `${member.roles.highest}` : 'Nenhum', inline: true },
                { name: '🤖 É bot?', value: user.bot ? '✅ Sim' : '❌ Não', inline: true }
            )

        await interaction.reply({
            content: `Informações de ${user}`,
            embeds: [embed],
            flags: [MessageFlags.Ephemeral]
        });

    } catch (error) {
        logger.error('Erro no comando userinfo:', error);

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: '❌ Ocorreu um erro ao buscar as informações do usuário!', flags: [MessageFlags.Ephemeral] });
        } else {
            await interaction.reply({ content: '❌ Ocorreu um erro ao buscar as informações do usuário!', flags: [MessageFlags.Ephemeral] });
        }
    }
}
