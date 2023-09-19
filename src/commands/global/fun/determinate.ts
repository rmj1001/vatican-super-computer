import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "@src/lib/handlers/SlashCommandHandler";

let slashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("determinate")
        .setDescription("GOTTA TURN THE WORLD INTO YOUR DANCE FLOOR"),
    help: {
        name: "determinate",
        category: "fun",
        description: "Lemonade mouth",
        usage: "determinate",
    },
    async execute(interaction: ChatInputCommandInteraction) {
        let lyrics: string = `
Gotta turn the world into your dance floor
**Determinate, determinate**
Push until you can't and then demand more
**Determinate, determinate**
You and me together, we can make it better
Gotta turn the world into your dance floor
**Determinate, determinate**`;

        await interaction.reply(lyrics);
    },
};

module.exports = slashCommand;
