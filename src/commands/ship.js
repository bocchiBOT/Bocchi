import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, InteractionContextType } from "discord.js";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import logger from '../utils/logger.js';

export const data = new SlashCommandBuilder()
  .setContexts(InteractionContextType.Guild)
  .setName("ship")
  .setDescription("Calculadora de compatibilidade amorosa!")
  .addUserOption(option =>
    option.setName("pessoa1")
      .setDescription("Primeira pessoa")
      .setRequired(true)
  )
  .addUserOption(option =>
    option.setName("pessoa2")
      .setDescription("Segunda pessoa")
      .setRequired(true)
  );

export async function execute(interaction) {
  try {
    const pessoa1 = interaction.options.getUser("pessoa1");
    const pessoa2 = interaction.options.getUser("pessoa2");

    await interaction.deferReply();

    const compatibility = Math.floor(Math.random() * 100) + 1;
    const message = getLoveMessage(compatibility);

    const avatar1Url = pessoa1.displayAvatarURL({ size: 512, extension: "png" });
    const avatar2Url = pessoa2.displayAvatarURL({ size: 512, extension: "png" });
    const heartUrl = "https://i.postimg.cc/PqYd2Fyk/pngwing-com.png";

    const [avatar1, avatar2, heart] = await Promise.all([
      loadImage(avatar1Url),
      loadImage(avatar2Url),
      loadImage(heartUrl)
    ]);

    const avatarSize = 200;
    const heartSize = 150;
    const width = avatarSize * 2 + heartSize;
    const height = Math.max(avatarSize, heartSize);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const yAvatar = (height - avatarSize) / 2;
    const yHeart = (height - heartSize) / 2;

    ctx.drawImage(avatar1, 0, yAvatar, avatarSize, avatarSize);
    ctx.drawImage(heart, avatarSize, yHeart, heartSize, heartSize);
    ctx.drawImage(avatar2, avatarSize + heartSize, yAvatar, avatarSize, avatarSize);

    const buffer = await canvas.encode("png");
    const attachment = new AttachmentBuilder(buffer, { name: "love_image.png" });

    const embed = new EmbedBuilder()
      .setTitle("💕 Calculadora de Amor!")
      .setDescription(`**${pessoa1} + ${pessoa2} = ${compatibility}% de compatibilidade**\n${message}`)
      .setColor(0xFF69B4)
      .setImage("attachment://love_image.png")

    await interaction.editReply({ embeds: [embed], files: [attachment] });

    } catch (error) {
        logger.error("Error in the ship command:", error);
        try {
            const respond = interaction.deferred || interaction.replied ? interaction.followUp : interaction.reply;
            await respond({ content: "❌ Ocorreu um erro inesperado.", flags: [MessageFlags.Ephemeral] });
        } catch {}
    }
}

function getLoveMessage(compatibility) {
  if (compatibility === 0) return "Opa, nenhum sinal de amor por aqui... 😢";
  if (compatibility <= 25) return "O cupido precisa treinar a pontaria! 🏹";
  if (compatibility <= 50) return "Há algo aí, mas ainda falta aquela faísca mágica! ✨";
  if (compatibility <= 75) return "Vocês estão no caminho certo. Um pouco mais de química e será perfeito! 🌟";
  if (compatibility <= 99) return "O amor está florescendo! 💖";
  return "Vocês são a alma gêmea um do outro! ❤️";
}
