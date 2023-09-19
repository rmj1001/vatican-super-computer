import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";
import bot from "@src/index";
import { SlashCommand } from "@src/lib/handlers/SlashCommandHandler";

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("restart")
        .setDescription("Restart bot application."),
    flags: {
        developerOnly: true,
        disabled: false,
    },
    help: {
        name: "restart",
        category: "devtools",
        description: "Restart bot application.",
        usage: "restart",
    },
    async execute(interaction: ChatInputCommandInteraction) {
        const restartEmbed = new EmbedBuilder()
            .setTitle("Restart Notification")
            .setColor(0xf5425d)
            .setThumbnail("https://cdn3.emoji.gg/emojis/6174-w98-computer.png")
            .setDescription("Restarting bot.")
            .setTimestamp();

        await interaction.reply({
            embeds: [restartEmbed],
            ephemeral: true,
        });

        await bot.restart();
    },
};

module.exports = command;
