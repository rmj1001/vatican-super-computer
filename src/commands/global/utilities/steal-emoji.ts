import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    Message,
    SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "@src/lib/handlers/SlashCommandHandler";
import bot from "@src/index";

interface Emoji {
    name: string;
    id: string;
    isAnimated: boolean;
    url: string;
}

function parseMessageForEmoji(message: Message): Emoji[] {
    const content = message.content;
    const emojiRegex = /<a?:\w+:\d+>/;
    const animatedRegex = /<a:\w+:\d+>/;
    const isEmoji = emojiRegex.test(content);
    const parseEmoji = content.match(emojiRegex);
    let emojis: Emoji[] = [];

    if (!isEmoji) return;

    for (const emoji in parseEmoji) {
        const id: string = emoji.split(":")[2].replace(">", "");
        const isAnimated: boolean = animatedRegex.test(emoji);

        let emojiJSON: Emoji = {
            name: emoji.split(":")[1],
            id: id,
            isAnimated: isAnimated,
            url: `https://cdn.discordapp.com/emojis/${id}${
                isAnimated ? ".gif" : ".png"
            }`,
        };

        emojis.push(emojiJSON);
    }

    return emojis;
}

interface DiscordMessage {
    guildid: string;
    channelid: string;
    messageid: string;
}

function parseURLForMessageid(url: string): string {
    try {
        return /https:\/\/discord\.com\/channels\/\d{18}\/\d{18}\/(\d{18})/g.exec(
            url,
        )[0];
    } catch (error) {
        bot.logger.error(`URL couldn't be parsed.`, error);
        return;
    }
}

let slashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("steal-emoji")
        .setDescription("Reply to a message to get an image of the emoji.")
        .addStringOption((link) =>
            link
                .setName("link")
                .setDescription("Discord message URL")
                .setRequired(true),
        ),
    flags: {
        disabled: true,
    },
    help: {
        name: "steal-emoji",
        category: "utilities",
        description: "Reply to a message to get an image of the emoji.",
        usage: "steal-emoji",
    },
    async execute(interaction: ChatInputCommandInteraction) {
        let link = interaction.options.getString("link");

        if (!link) {
            await interaction.reply("You must provide a discord link!");
            return;
        }

        let messageID = parseURLForMessageid(link);

        if (!messageID) {
            await interaction.reply(
                "That is not a valid discord message link.",
            );
            return;
        }

        let message = interaction.channel.messages.cache.find(
            (msg) => msg.id === messageID,
        );

        if (!message) {
            await interaction.reply(
                "That message does not exist in this channel. Please link to a message in this channel.",
            );
            return;
        }

        let emojis = await parseMessageForEmoji(message);

        if (!emojis) {
            await interaction.reply("There were no emojis in this message!");
            return;
        }

        let emojiEmbeds = [];

        for (const emoji of emojis) {
            const emojiEmbed = new EmbedBuilder()
                .setTitle("Emoji Image")
                .setImage(emoji.url);

            emojiEmbeds.push(emojiEmbed);
        }

        await interaction.reply({
            embeds: emojiEmbeds,
            ephemeral: true,
        });
    },
};

module.exports = slashCommand;
