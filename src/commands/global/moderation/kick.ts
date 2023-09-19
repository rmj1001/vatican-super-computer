import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    GuildMember,
    PermissionFlagsBits,
    SlashCommandBuilder,
    bold,
    codeBlock,
    escapeUnderline,
    inlineCode,
} from "discord.js";
import { SlashCommand } from "@src/lib/handlers/SlashCommandHandler";

let slashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick a user from the server!")
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
        name: "kick",
        category: "moderation",
        description: "Kick a user from the server.",
        usage: "ban user: notify:boolean reason?:string",
        permissions: ["KickMembers"],
    },
    async execute(interaction: ChatInputCommandInteraction) {
        const member = interaction.guild.members.cache.get(
            interaction.options.getUser("user")!.id,
        ) as GuildMember;
        const reason =
            interaction.options.getString("reason") || "No reason provided.";
        const notify: boolean = interaction.options.getBoolean("notify");

        const kickNotificationEmbed = new EmbedBuilder()
            .setTitle("Kick Notification")
            .setColor(0xf5425d)
            .setThumbnail("https://cdn3.emoji.gg/emojis/2184-zenyattakick.png")
            .setTimestamp()
            .addFields(
                { name: "Server", value: interaction.guild.name },
                { name: "Moderator", value: interaction.user.displayName },
                { name: "Reason", value: reason },
            );

        if (notify) await member.send({ embeds: [kickNotificationEmbed] });

        await member.kick(reason);

        await interaction.reply({
            embeds: [kickNotificationEmbed],
            ephemeral: true,
        });

        return;
    },
};

module.exports = slashCommand;
