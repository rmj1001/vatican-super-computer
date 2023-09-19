import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    hyperlink,
} from "discord.js";
import bot from "@src/index";
import { SlashCommand } from "@src/lib/handlers/SlashCommandHandler";
import { convertSecondsToTimeString } from "@src/lib/time";

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Get information and statistics about the bot."),
    help: {
        name: "info",
        category: "utilities",
        description: "Get information and statistics about the bot.",
        usage: "info",
    },
    async execute(interaction: ChatInputCommandInteraction) {
        const infoEmbed = new EmbedBuilder()
            .setColor(0xf5425d)
            .setTitle("Bot Information and Statistics")
            .setThumbnail(
                "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Logo_informations.svg/240px-Logo_informations.svg.png",
            )
            .setImage(bot.client.user.avatarURL())
            .addFields(
                {
                    name: "Latency",
                    value: `${Date.now() - interaction.createdTimestamp}ms`,
                    inline: true,
                },
                {
                    name: "API Latency",
                    value: `${Math.round(bot.client.ws.ping)}ms`,
                    inline: true,
                },
                {
                    name: "Uptime",
                    value: convertSecondsToTimeString(bot.client.uptime / 1000),
                    inline: false,
                },
                {
                    name: "Bot Invite",
                    value: hyperlink("Click Here", bot.config.inviteURL),
                    inline: true,
                },
                {
                    name: "Developer Server",
                    value: hyperlink(
                        "Click Here",
                        bot.config.developerGuildURL,
                    ),
                    inline: true,
                },
                { name: "Bot ID", value: bot.client.user.id, inline: true },
            )
            .setDescription(
                bot.config.description || "No description set by developer.",
            )
            .setTimestamp();

        await interaction.reply({ embeds: [infoEmbed] });
    },
};

module.exports = command;
