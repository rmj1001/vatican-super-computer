import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    GuildMember,
    PermissionFlagsBits,
    SlashCommandBuilder,
    userMention,
} from "discord.js";
import { SlashCommand } from "@src/lib/handlers/SlashCommandHandler";
import {
    convertTimeStringToSeconds,
    convertSecondsToTimeString,
    timeInMiliseconds,
    timeInSeconds,
} from "@src/lib/time";

let slashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("timeout")
        .setDescription("Timeout a user")
        .addUserOption((user) =>
            user
                .setName("user")
                .setDescription("The user to time out.")
                .setRequired(true),
        )
        .addStringOption((length) =>
            length
                .setName("length")
                .setDescription("The length of time to time out for")
                .setRequired(true),
        )
        .addStringOption((reason) =>
            reason
                .setName("reason")
                .setDescription("The reason for the time out")
                .setRequired(true),
        )
        .addBooleanOption((notify) =>
            notify
                .setName("notify")
                .setDescription("Notify the user?")
                .setRequired(true),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    flags: {
        guildOnly: true,
    },
    help: {
        name: "timeout",
        category: "moderation",
        description: "Timeout a user.",
        usage: "timeout user: length:23d 1h 5m 10s reason:mishbehavior",
        permissions: ["ModerateMembers"],
    },
    async execute(interaction: ChatInputCommandInteraction) {
        const userId = interaction.options.getUser("user")!.id;
        const member = interaction.guild?.members.cache.get(
            userId,
        ) as GuildMember;
        const notify: boolean = interaction.options.getBoolean("notify");
        const reason =
            interaction.options.getString("reason") || "No reason given.";

        const timeString = interaction.options.getString("length")!;
        const timeregex = /(\d+)([wdhms])/g;

        if (!timeregex.test(timeString)) {
            await interaction.reply({
                content: `Invalid time string: ${timeString}. Please use '#h #m #s' format.`,
                ephemeral: true,
            });
            return;
        }

        if (!member) {
            await interaction.reply("I could not find that member.");
            return;
        }

        const seconds = convertTimeStringToSeconds(timeString);

        if (seconds > timeInSeconds.day * 28) {
            await interaction.reply({
                content: "You cannot time someone out for longer than 28 days!",
                ephemeral: true,
            });
            return;
        }

        const timeoutNotificationEmbed = new EmbedBuilder()
            .setTitle("Timeout Notification")
            .setColor(0xf5425d)
            .setThumbnail("https://cdn3.emoji.gg/emojis/3616-peepomute.png")
            .setTimestamp()
            .addFields(
                { name: "Server", value: interaction.guild.name, inline: true },
                {
                    name: "Moderator",
                    value: userMention(interaction.user.id),
                    inline: true,
                },
                {
                    name: "Length",
                    value: convertSecondsToTimeString(seconds),
                    inline: true,
                },
                { name: "Reason", value: reason, inline: false },
            );

        await member.timeout(seconds * timeInMiliseconds.seconds, reason);

        if (notify) await member?.send({ embeds: [timeoutNotificationEmbed] });

        await interaction.reply({
            embeds: [timeoutNotificationEmbed],
            ephemeral: true,
        });
        return;
    },
};

module.exports = slashCommand;
