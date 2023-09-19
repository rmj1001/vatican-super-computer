import { bot } from "@bot";
import { Events } from "discord.js";

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute() {
        bot.logger.botLog(`Logged in as ${bot.client.user.tag}`);
    },
};
