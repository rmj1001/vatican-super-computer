import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    GuildMember,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "@src/lib/handlers/SlashCommandHandler";

let slashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban a user from the server!")
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption((user) =>
            user
                .setName("user")
                .setDescription("The user to be banned")
                .setRequired(true),
        )
        .addStringOption((reason) =>
            reason
                .setName("reason")
                .setDescription("The reason for the ban")
                .setRequired(true),
        )
        .addBooleanOption((notify) =>
            notify
                .setName("notify")
                .setDescription("Notify the user?")
                .setRequired(true),
        ),
    flags: {
        guildOnly: true,
    },
    help: {
        name: "ban",
        category: "moderation",
        description: "Ban a user from the server.",
        usage: "ban user: reason?:",
        permissions: ["BanMembers"],
    },
    async execute(interaction: ChatInputCommandInteraction) {
        const member = interaction.guild.members.cache.get(
            interaction.options.getUser("user")!.id,
        ) as GuildMember;
        const reason =
            interaction.options.getString("reason") || "No reason provided.";
        const notify: boolean = interaction.options.getBoolean("notify");

        const banNotificationEmbed = new EmbedBuilder()
            .setTitle("Ban Notification")
            .setColor(0xf5425d)
            .setThumbnail(
                "https://emoji.discadia.com/emojis/1e603d31-87d1-4928-8564-56407e83da01.PNG",
            )
            .setTimestamp()
            .addFields(
                { name: "Server", value: interaction.guild.name },
                { name: "Moderator", value: interaction.user.displayName },
                { name: "Reason", value: reason },
            );

        if (notify) await member.send({ embeds: [banNotificationEmbed] });

        await member.ban({
            deleteMessageSeconds: 0,
            reason: reason,
        });

        await interaction.reply({
            embeds: [banNotificationEmbed],
            ephemeral: true,
        });

        return;
    },
};

module.exports = slashCommand;
