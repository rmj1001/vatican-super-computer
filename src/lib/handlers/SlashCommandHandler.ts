import {
    ChatInputCommandInteraction,
    Collection,
    EmbedBuilder,
    Routes,
} from "discord.js";
import * as path from "path";
import Bot from "@src/lib/bot";
import { getFilesRecursive } from "@lib/fs";

export interface CommandHelpInformation {
    name: string;
    description: string;
    usage: string;
    category?: string;
    permissions?: string[];
    examples?: string[];
}

export interface CommandFlags {
    disabled?: boolean;
    developerOnly?: boolean;
    guildOnly?: boolean;
    dmOnly?: boolean;
}

export interface SlashCommand {
    // data: SlashCommandBuilder | SlashCommandSubcommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandGroupBuilder | SlashCommandSubcommandsOnlyBuilder;
    data: any;
    help: CommandHelpInformation;
    execute: Function;
    flags?: CommandFlags;
}

interface SlashCommandCache {
    cache: Collection<string, SlashCommand>;
    files: string[];
    filePaths: string[];
    JSONs: any[];
}

export default class SlashCommandHandler {
    public bot: Bot;

    public global: SlashCommandCache;
    public developer: SlashCommandCache;

    constructor(bot: Bot) {
        this.bot = bot;

        this.global = {
            cache: new Collection(),
            files: [],
            filePaths: [],
            JSONs: [],
        };

        this.developer = {
            cache: new Collection(),
            files: [],
            filePaths: [],
            JSONs: [],
        };
    }

    async populateCache() {
        const commandFolderContents: string[] = getFilesRecursive(
            this.bot.folders.commands,
        );

        if (!commandFolderContents) return;
        if (commandFolderContents.length < 1) return;

        for (const file of commandFolderContents) {
            const filePath = path.join(this.bot.folders.commands, file);
            const command = require(filePath);

            if (!("data" in command)) {
                this.bot.logger.warn(
                    `The command ${filePath} is missing a required 'data' property.`,
                );
            }

            if (!("execute" in command)) {
                this.bot.logger.warn(
                    `The command ${filePath} is missing a required 'execute' property.`,
                );
            }

            command.data.path = filePath;

            if (command.flags?.developerOnly) {
                this.developer.filePaths.push(filePath);
                this.developer.cache.set(command.data.name, command);
                this.developer.JSONs.push(command.data.toJSON());

                this.bot.logger.command(
                    `Successfully loaded DEVELOPER command '${command.data.name}'.`,
                    true,
                );
            } else {
                this.global.filePaths.push(filePath);
                this.global.cache.set(command.data.name, command);
                this.global.JSONs.push(command.data.toJSON());

                this.bot.logger.command(
                    `Successfully loaded GLOBAL command '${command.data.name}'.`,
                    true,
                );
            }
        }
    }

    async deleteCache(commandName: string) {
        const developerCommand = this.developer.cache.find(
            (cmd) => cmd.data.name === commandName,
        );
        const globalCommand = this.global.cache.find(
            (cmd) => cmd.data.name === commandName,
        );

        if (!developerCommand && !globalCommand) return;

        if (developerCommand) {
            commandName = developerCommand.data.name;

            delete require[require.resolve(developerCommand.data.path)];
            this.developer.cache.delete(commandName);
        }

        if (globalCommand) {
            commandName = globalCommand.data.name;

            delete require[require.resolve(globalCommand.data.path)];
            this.global.cache.delete(commandName);
        }

        this.bot.logger.command(
            `Successfully deleted command '${commandName}' from the cache.`,
            true,
        );
    }

    async deleteCacheGroup(type: "action-rows" | "buttons" | "all" = "all") {
        const deleteGlobalCache = () => {
            this.global.filePaths.forEach((file) => {
                delete require[require.resolve(file)];
                this.bot.logger.command(
                    `Successfully deleted command file '${file}' from the cache.`,
                    true,
                );
            });

            this.global.files = [];
            this.global.filePaths = [];
            this.global.JSONs = [];
            this.global.cache = new Collection();
        };

        const deleteDeveloperCache = () => {
            this.developer.filePaths.forEach((file) => {
                delete require[require.resolve(file)];
                this.bot.logger.command(
                    `Successfully deleted command file '${file}' from the cache.`,
                    true,
                );
            });

            this.developer.files = [];
            this.developer.filePaths = [];
            this.developer.JSONs = [];
            this.developer.cache = new Collection();
        };

        switch (type) {
            case "buttons":
                await deleteDeveloperCache();
                break;
            case "action-rows":
                await deleteGlobalCache();
                break;
            case "all":
                await deleteDeveloperCache();
                await deleteGlobalCache();
                break;
        }
    }

    async registerCommandsWithDiscordAPI(
        type: "action-rows" | "buttons" | "all" = "all",
    ) {
        const registerGlobalCommands = async () => {
            if (this.global.cache.size > 0) {
                await this.bot.logger.api(
                    `Started refreshing ${this.global.cache.size} GLOBAL (/) commands.`,
                );

                // The put method is used to fully refresh all commands in the guild with the current set
                const data: any = await this.bot.rest.put(
                    Routes.applicationCommands(`${this.bot.config.botUserID}`),
                    { body: this.global.JSONs },
                );

                await this.bot.logger.api(
                    `Successfully refreshed ${data.length} GLOBAL (/) commands.`,
                    true,
                );
            }
        };

        const registerDeveloperCommands = async () => {
            if (this.developer.cache.size > 0) {
                await this.bot.logger.api(
                    `Started refreshing ${this.developer.cache.size} DEVELOPER (/) commands.`,
                );

                // The put method is used to fully refresh all commands in the guild with the current set
                const data: any = await this.bot.rest.put(
                    Routes.applicationGuildCommands(
                        this.bot.config.botUserID,
                        this.bot.config.developerGuildID,
                    ),
                    { body: this.developer.JSONs },
                );

                await this.bot.logger.api(
                    `Successfully refreshed ${data.length} DEVELOPER (/) commands.`,
                    true,
                );
            }
        };

        switch (type) {
            case "buttons":
                await registerDeveloperCommands();
                break;
            case "action-rows":
                await registerGlobalCommands();
                break;
            case "all":
                await registerDeveloperCommands();
                await registerGlobalCommands();
                break;
        }
    }

    async deregisterCommandsWithDiscordAPI(
        type: "action-rows" | "buttons" | "all" = "all",
    ) {
        const deregisterDeveloperCommands = async () => {
            await this.bot.logger.bot(
                `De-registering DEVELOPER slash commands.`,
            );
            await this.bot.client.guilds.cache
                .find((guild) => guild.id === this.bot.config.developerGuildID)
                ?.commands.set([])
                .then(() =>
                    this.bot.logger.bot(
                        "Successfully deregistered all DEVELOPER slash commands.",
                        true,
                    ),
                )
                .catch((error) =>
                    this.bot.logger.error(
                        "Could not de-register DEVELOPER slash commands: ",
                        error,
                    ),
                );
        };

        const deregisterGlobalCommands = async () => {
            await this.bot.logger.bot(`De-registering GLOBAL slash commands.`);
            await this.bot.client.application.commands
                .set([])
                .then(() =>
                    this.bot.logger.bot(
                        "Successfully deregistered all GLOBAL slash commands.",
                        true,
                    ),
                )
                .catch((error) =>
                    this.bot.logger.error(
                        "Could not de-register GLOBAL slash commands: ",
                        error,
                    ),
                );
        };

        switch (type) {
            case "action-rows":
                await deregisterGlobalCommands();
                break;
            case "buttons":
                await deregisterDeveloperCommands();
                break;
            case "all":
                await deregisterGlobalCommands();
                await deregisterDeveloperCommands();
                break;
        }
    }

    async load() {
        await this.populateCache();
        await this.registerCommandsWithDiscordAPI();
    }

    async unload() {
        await this.deleteCacheGroup();
        await this.deregisterCommandsWithDiscordAPI();
    }

    async reload() {
        await this.unload();
        await this.load();
    }

    public async checkFlags(
        command: SlashCommand,
        interaction: ChatInputCommandInteraction,
    ): Promise<boolean> {
        const permissionErrorEmbed = new EmbedBuilder()
            .setTitle("Permission Error")
            .setColor(0xf5425d)
            .setThumbnail(
                "https://cdn3.emoji.gg/emojis/8444-cartoonybriefcase.png",
            )
            .setTimestamp();

        if (
            command.flags?.developerOnly &&
            !this.bot.config.developers?.includes(interaction.user.id)
        ) {
            permissionErrorEmbed.setDescription(
                "Only bot developers may run this command.",
            );
            await interaction.reply({ embeds: [permissionErrorEmbed] });
            return false;
        }
        if (command.flags?.disabled) {
            permissionErrorEmbed.setDescription("This command is disabled.");
            await interaction.reply({ embeds: [permissionErrorEmbed] });
            return false;
        }

        if (command.flags?.guildOnly && !interaction.guild) {
            permissionErrorEmbed.setDescription(
                "This command must be run in a server.",
            );
            await interaction.reply({ embeds: [permissionErrorEmbed] });
            return false;
        }

        if (command.flags?.dmOnly && !interaction.channel.isDMBased) {
            permissionErrorEmbed.setDescription(
                "This command must only be run in DMs.",
            );
            await interaction.reply({ embeds: [permissionErrorEmbed] });
            return false;
        }

        return true;
    }
}
