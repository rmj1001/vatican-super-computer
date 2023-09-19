import bot from "@src/index";
import { Event } from "@src/lib/handlers/EventHandler";

let event: Event = {
    name: "SIGQUIT",
    once: true,
    async execute() {
        await bot.shutdown({});
    },
};

module.exports = event;
