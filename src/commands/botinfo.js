import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import 'dotenv/config';
import logger from '../utils/logger.js';
import emojis from '../utils/emojis.js';

export const data = new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Veja algumas informações sobre o bot.');

export async function execute(interaction) {
    try {
        const client = interaction.client;

        const totalGuilds = client.guilds.cache.size;
        const totalUsers = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);

        const ownerId = process.env.OWNER_ID;
        const ownerLink = `https://discord.com/users/${ownerId}`;
        const githubLink = 'https://github.com/bocchiBOT';

        const image = `https://i.postimg.cc/tTgWZMGF/Bocchi-Clap.gif`;


        const embed = new EmbedBuilder()
            .setColor(0xFF69B4)
            .setTitle(`Olá, eu sou a ${client.user.username}`)
            .setDescription(
                `Ola eu sou a ${client.user.username}, fui desenvolvida no intuito de melhorar a experiência no dia a dia do seu servidor <3\n` +
                `Atualmente estou em **${totalGuilds} servidores** servindo **${totalUsers} usuários**`

            )
            .setImage(image)

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('GitHub')
                .setStyle(ButtonStyle.Link)
                .setURL(githubLink)
                .setEmoji(emojis.github),
            new ButtonBuilder()
                .setLabel('Developer')
                .setStyle(ButtonStyle.Link)
                .setURL(ownerLink)
                .setEmoji(emojis.developer) 
        );

        await interaction.reply({
            embeds: [embed],
            components: [row],
            flags: [MessageFlags.Ephemeral]
        });

    } catch (error) {
        logger.error('Erro no comando bocchiinfo:', error);

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: '❌ Ocorreu um erro ao mostrar as informações do bot!', flags: [MessageFlags.Ephemeral] });
        } else {
            await interaction.reply({ content: '❌ Ocorreu um erro ao mostrar as informações do bot!', flags: [MessageFlags.Ephemeral] });
        }
    }
}
