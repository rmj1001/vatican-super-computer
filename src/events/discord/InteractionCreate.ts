import bot from "@src/index";
import { Event } from "@src/lib/handlers/EventHandler";
import { Events, Interaction } from "discord.js";

const event: Event = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction: Interaction) {
        if (interaction.isChatInputCommand()) {
            const globalCommand = bot.commands.global.cache.get(
                interaction.commandName,
            );
            const developerCommand = bot.commands.developer.cache.get(
                interaction.commandName,
            );

            if (globalCommand) {
                try {
                    if (
                        !(await bot.commands.checkFlags(
                            globalCommand,
                            interaction,
                        ))
                    )
                        return;

                    await globalCommand.execute(interaction);
                } catch (error) {
                    console.error(error);
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({
                            content:
                                "There was an error while executing this command!",
                            ephemeral: true,
                        });
                    } else {
                        await interaction.reply({
                            content:
                                "There was an error while executing this command!",
                            ephemeral: true,
                        });
                    }
                }
            } else if (developerCommand) {
                try {
                    if (
                        !(await bot.commands.checkFlags(
                            developerCommand,
                            interaction,
                        ))
                    )
                        return;

                    await developerCommand.execute(interaction);
                } catch (error) {
                    console.error(error);
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({
                            content:
                                "There was an error while executing this command!",
                            ephemeral: true,
                        });
                    } else {
                        await interaction.reply({
                            content:
                                "There was an error while executing this command!",
                            ephemeral: true,
                        });
                    }
                }
            } else {
                bot.logger.error(
                    `No command matching ${interaction.commandName} was found.`,
                );
                return;
            }
        }

        if (interaction.isButton()) {
            bot.logger.error(`Buttons are not yet implemented.`);
            return;
            // TODO Change when button handler is implemented.
        }
    },
};

module.exports = event;
