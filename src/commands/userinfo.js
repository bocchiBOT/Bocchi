import { SlashCommandBuilder, EmbedBuilder, MessageFlags, time } from 'discord.js';
import logger from '../utils/logger.js';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import 'dayjs/locale/pt-br.js';

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

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
        const targetMember = interaction.options.getMember('usuário') || interaction.member;
        const targetUser = targetMember.user;

        const createdAt = targetUser.createdAt;
        const joinedAt = targetMember.joinedAt;

        const createdDiff = dayjs(createdAt).fromNow();
        const joinedDiff = joinedAt ? dayjs(joinedAt).fromNow() : '❌ Não disponível';

        const embed = new EmbedBuilder()
            .setColor(targetMember.displayColor || 0x3498DB)
            .setAuthor({ name: `${targetMember.displayName}`, iconURL: targetUser.displayAvatarURL({ size: 256 }) })
            .setThumbnail(targetUser.displayAvatarURL({ size: 512 }))
            .addFields(
                { name: '🆔 ID:', value: `\`${targetUser.id}\``, inline: true },
                { name: '🏷️ Tag:', value: `\`${targetUser.tag}\``, inline: true },
                { name: '📅 Conta criada em:', value: `${time(createdAt, 'f')} (${createdDiff})`, inline: false },
                { name: '🚪 Entrou no servidor em:', value: joinedAt ? `${time(joinedAt, 'f')} (${joinedDiff})` : '❌ Não disponível', inline: false },
                { name: '⬆ Maior cargo:', value: targetMember.roles.highest?.id !== interaction.guild.id ? `${targetMember.roles.highest}` : 'Nenhum', inline: true },
                { name: '🤖 É bot?', value: targetUser.bot ? '✅ Sim' : '❌ Não', inline: true }
            );

        await interaction.reply({
            content: `Informações de ${targetUser}`,
            embeds: [embed],
            flags: [MessageFlags.Ephemeral]
        });

    } catch (error) {
        logger.error("Error in the userinfo command:", error);
        try {
            const respond = interaction.deferred || interaction.replied ? interaction.followUp : interaction.reply;
            await respond({ content: "❌ Ocorreu um erro inesperado.", flags: [MessageFlags.Ephemeral] });
        } catch {}
    }
}
