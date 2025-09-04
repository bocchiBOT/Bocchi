import { SlashCommandBuilder, EmbedBuilder, MessageFlags} from 'discord.js';
import logger from '../utils/logger.js';

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
      AvatarEmbed(
        'Avatar Global',
        targetUser.displayAvatarURL({ size: 4096 }),
        targetMember?.displayColor ?? 0xFF69B4
      )
    ];
          
    if (targetMember) {      
      const guildAvatar = targetMember.avatarURL({ size: 4096 });
      if (guildAvatar) {                                      
        embeds.push(AvatarEmbed('Avatar do Servidor', guildAvatar, targetMember.displayColor));
      }
    }

    await interaction.reply({ 
      content: `Avatar de ${targetUser}`,
      embeds,
      flags: [MessageFlags.Ephemeral],
    });

  } catch (error) {
    logger.error("Error in the avatar command:", error);
    try {
      const respond = interaction.deferred || interaction.replied ? interaction.followUp : interaction.reply;
      await respond({ content: "❌ Ocorreu um erro inesperado.", flags: [MessageFlags.Ephemeral] });
    } catch {}
  }
}

function AvatarEmbed(title, imageURL, color) {
  return new EmbedBuilder()
    .setTitle(title)
    .setImage(imageURL)
    .setColor(color);
}
