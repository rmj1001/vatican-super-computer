import {
    ChannelType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    TextChannel,
} from "discord.js";
import bot from "@src/index";
import { SlashCommand } from "@src/lib/handlers/SlashCommandHandler";

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("echo")
        .setDescription("Echo some text")
        .addStringOption((option) =>
            option
                .setName("text")
                .setDescription("The text to send to the channel.")
                .setRequired(true),
        )
        .addChannelOption((option) =>
            option
                .setName("channel")
                .setDescription("The channel to send the text to")
                .setRequired(false)
                .addChannelTypes(ChannelType.GuildText),
        )
        .addStringOption((option) =>
            option
                .setName("channel-id")
                .setDescription(
                    "Set a channel ID if the channel is outside the current guild.",
                )
                .setRequired(false),
        ),
    flags: {
        developerOnly: true,
    },
    help: {
        name: "echo",
        category: "fun",
        description: "Print text to the current or another channel.",
        usage: "echo text:string channel?: channel-id:number",
        examples: ["echo text:Testing 123 "],
    },
    async execute(interaction: ChatInputCommandInteraction) {
        const text = await interaction.options.getString("text");
        const channel = await interaction.options.getChannel("channel");
        const channelID = await interaction.options.getString("channel-id");

        if (channel) {
            let guildChannel;
            guildChannel = interaction.guild.channels.cache.find(
                (c) => c.id === channel.id,
            );
            if (!guildChannel) {
                interaction.reply("Invalid channel.");
                return;
            }

            await (guildChannel as TextChannel).send(text);
            await interaction.reply("Message sent.");
            return;
        }

        if (channelID) {
            let channel;
            channel = bot.client.channels.cache.find((c) => c.id === channelID);

            if (!channel && channel.ChannelType === TextChannel) {
                await interaction.reply("Invalid channel.");
                return;
            }

            await (channel as TextChannel).send(text);
            await interaction.reply("Message sent.");
            return;
        }

        await interaction.reply(text);
        return;
    },
};

module.exports = command;
