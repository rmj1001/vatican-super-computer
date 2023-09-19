import bot from "@src/index";
import { Event } from "@src/lib/handlers/EventHandler";
import { Events } from "discord.js";

let event: Event = {
    name: Events.Error,
    once: false,
    execute(error: Error) {
        bot.logger.error("DiscordJS: ", error);
    },
};

module.exports = event;
