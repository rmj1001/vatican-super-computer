import bot from "@src/index";
import { Event } from "@src/lib/handlers/EventHandler";
import { randomItemFromArray } from "@src/lib/math";
import { generateTimestampFromDate } from "@src/lib/time";
import { ActivityType, Events, TextChannel } from "discord.js";

const event: Event = {
    name: Events.ClientReady,
    once: true,
    async execute() {
        bot.config.userStatus = randomItemFromArray(bot.config.userStatuses);

        bot.client.user.setPresence({
            activities: [
                { name: bot.config.userStatus, type: ActivityType.Listening },
            ],
            status: bot.config.userOnline,
        });

        bot.developerConsoleChannel = (await bot.client.channels.cache.find(
            (ch) => ch.id === bot.config.developerLogChannelID,
        )) as TextChannel;

        await bot.logger.bot(
            `Logged in as '${bot.client.user.tag}'. Time: ${
                generateTimestampFromDate().string
            }`,
            true,
        );
    },
};

module.exports = event;
