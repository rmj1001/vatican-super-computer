import bot from "@src/index";
import { Event } from "@src/lib/handlers/EventHandler";

let event: Event = {
    name: "unhandledRejection",
    once: false,
    async execute(error: Error) {
        await bot.logger.error("Unhandled promise rejection:", error);
    },
};

module.exports = event;
