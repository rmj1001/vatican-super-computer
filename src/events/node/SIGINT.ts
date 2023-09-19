import bot from "@src/index";
import { Event } from "@src/lib/handlers/EventHandler";

let event: Event = {
    name: "SIGINT",
    once: true,
    async execute() {
        await bot.shutdown({});
    },
};

module.exports = event;
