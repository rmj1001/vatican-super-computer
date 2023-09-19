import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    GuildMember,
    User,
    Guild,
} from "discord.js";
import bot from "@src/index";
import { SlashCommand } from "@src/lib/handlers/SlashCommandHandler";

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Retrieve the avatar of a user")
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("The target user.")
                .setRequired(false),
        )
        .addStringOption((option) =>
            option
                .setName("user-id")
                .setDescription(
                    "Fetch user using ID if user is outside current guild.",
                )
                .setRequired(false),
        )
        .addBooleanOption((option) =>
            option
                .setName("server-profile")
                .setDescription(
                    "Provide the user's server avatar instead of default",
                )
                .setRequired(false),
        ),
    help: {
        name: "avatar",
        category: "utilities",
        description: "Retrieve the avatar of a user.",
        usage: "avatar user: user-id:number server-profile:boolean",
    },
    async execute(interaction: ChatInputCommandInteraction) {
        const avatarEmbed = new EmbedBuilder()
            .setColor(0xf5425d)
            .setTitle("User Avatar")
            .setTimestamp();

        const selectedUser = interaction.options.getUser("user");
        const inputtedID = interaction.options.getString("user-id");
        const displayServerAvatar =
            interaction.options.getBoolean("server-profile");

        if (displayServerAvatar) {
            let targetGuildMember: GuildMember | undefined;
            let guild: Guild = interaction.guild;
            let avatarURL: string;

            if (!guild) {
                await interaction.reply(
                    "This command cannot be run in DMs if server-profile is set to True.",
                );
            }

            targetGuildMember = interaction.guild.members.cache.find(
                (user) => user.id === selectedUser.id,
            );

            if (!targetGuildMember) {
                avatarEmbed.setDescription("I couldn't find that user.");
                await interaction.reply({ embeds: [avatarEmbed] });
                return;
            }

            avatarURL = targetGuildMember.avatarURL();

            if (!avatarURL) {
                avatarEmbed.setDescription(
                    "User does not have a server-only avatar.",
                );
                await interaction.reply({ embeds: [avatarEmbed] });
                return;
            }

            avatarEmbed.setImage(targetGuildMember.avatarURL());
            await interaction.reply({ embeds: [avatarEmbed] });
            return;
        }

        let targetUser: User | undefined;

        if (!selectedUser && !inputtedID) {
            avatarEmbed.setDescription("There was no selected user.");
        }

        if (selectedUser)
            targetUser = bot.client.users.cache.find(
                (user) => user.id === selectedUser.id,
            );

        if (inputtedID)
            targetUser = bot.client.users.cache.find(
                (user) => user.id === inputtedID,
            );

        if (!targetUser) {
            avatarEmbed.setDescription("I couldn't find that user.");
            await interaction.reply({ embeds: [avatarEmbed] });
            return;
        }

        avatarEmbed.setImage(targetUser.avatarURL());
        await interaction.reply({ embeds: [avatarEmbed] });
        return;
    },
};

module.exports = command;
