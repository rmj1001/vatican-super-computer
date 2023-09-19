import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";
import bot from "@src/index";
import { SlashCommand } from "@src/lib/handlers/SlashCommandHandler";

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("reload")
        .setDescription("Reload all commands and events for the bot."),
    flags: {
        developerOnly: true,
        disabled: false,
    },
    help: {
        name: "reload",
        category: "devtools",
        description: "Reload all commands and events for the bot.",
        usage: "reload",
    },
    async execute(interaction: ChatInputCommandInteraction) {
        const restartEmbed = new EmbedBuilder()
            .setTitle("Reload Notification")
            .setColor(0xf5425d)
            .setThumbnail("https://cdn3.emoji.gg/emojis/6174-w98-computer.png")
            .setDescription("Reloading commands and events.")
            .setTimestamp();

        await interaction.reply({
            embeds: [restartEmbed],
            ephemeral: true,
        });

        await bot.reloadHandlers();
    },
};

module.exports = command;
