import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";
import bot from "@src/index";
import { SlashCommand } from "@src/lib/handlers/SlashCommandHandler";

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("shutdown")
        .setDescription("Shut down the bot."),
    flags: {
        developerOnly: true,
    },
    help: {
        name: "shutdown",
        // category: 'devtools',
        description: "Shutdown the bot.",
        usage: "shutdown",
    },
    async execute(interaction: ChatInputCommandInteraction) {
        const shutdownEmbed = new EmbedBuilder()
            .setTitle("Shutdown Notification")
            .setColor(0xf5425d)
            .setThumbnail("https://cdn3.emoji.gg/emojis/6174-w98-computer.png")
            .setDescription("Shutting down.")
            .setTimestamp();

        await interaction.reply({
            embeds: [shutdownEmbed],
            ephemeral: true,
        });

        await bot.shutdown({});
    },
};

module.exports = command;
