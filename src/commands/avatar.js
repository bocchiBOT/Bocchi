import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('🖼️ Mostra o avatar de um usuário')
    .addUserOption(option =>
        option
            .setName('usuário')
            .setDescription('👤 Usuário para mostrar o avatar')
            .setRequired(false)
    );

export async function execute(interaction) {
    try {
        const targetMember = interaction.options.getMember('usuário') || interaction.member;
        const targetUser = targetMember.user;

        const embeds = [
            buildAvatarEmbed('Avatar Global', targetUser.avatarURL({ size: 4096 }) || targetUser.defaultAvatarURL)
        ];

        if (targetMember.avatarURL()) {
            embeds.push(buildAvatarEmbed('Avatar do Servidor', targetMember.avatarURL({ size: 4096 })));
        }

        await interaction.reply({
            content: `Avatar de ${targetUser}`,
            embeds,
            flags: [MessageFlags.Ephemeral]
        });

    } catch (error) {
        console.error('Erro no comando avatar:', error);
        
        await interaction.reply({
            content: '❌ Ocorreu um erro ao buscar o avatar!',
            flags: [MessageFlags.Ephemeral]
        });
    }
}

function buildAvatarEmbed(title, imageURL) {
    return new EmbedBuilder()
        .setTitle(title)
        .setImage(imageURL)
        .setColor(getColorFromUrl(imageURL))
        
}

// I wanted the dominant image color, but avoided extra libraries.
// This doesn’t give the true dominant color, just a simple and fun alternative.
function getColorFromUrl(url) {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
        hash += (hash << 5) + url.charCodeAt(i);
        hash |= 0;
    }
    return hash & 0xFFFFFF;
}
