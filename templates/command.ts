import {
    ChannelType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    TextChannel,
} from "discord.js";
import { SlashCommand } from "@lib/SlashCommandHandler";

let slashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("dm")
        .setDescription("Send a direct message to a user.")
        .addUserOption((user) =>
            user
                .setName("user")
                .setDescription("The user to direct message")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("text")
                .setDescription("The text to echo.")
                .setRequired(true),
        ),
    flags: {
        developerOnly: true,
    },
    help: {
        name: "dm",
        category: "devtools",
        description: "Send a direct message to a user.",
        usage: "dm user: message:",
    },
    async execute(interaction: ChatInputCommandInteraction) {
        let user = interaction.options.getUser("user");
        let text = interaction.options.getString("text");

        await user?.send(`${text}`);
        await interaction.reply(
            `Messaged user ${user?.username}#${user?.discriminator}.`,
        );
    },
};

module.exports = slashCommand;
