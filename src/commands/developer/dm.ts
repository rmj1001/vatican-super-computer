import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "@src/lib/handlers/SlashCommandHandler";
import bot from "@src/index";

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

        await interaction.client.users
            .send(user.id, text)
            .then(
                async () =>
                    await interaction.reply(
                        `Messaged user ${user?.username}#${user?.discriminator}.`,
                    ),
            )
            .catch(async (error) => {
                await interaction.reply(
                    `I couldn't send a DM to ${user.displayName}.`,
                );
                bot.logger.error(`I couldn't send a dm.`, error);
            });
    },
};

module.exports = slashCommand;
