import { Client, REST, TextChannel } from "discord.js";
import * as path from "path";
import Logger from "@lib/logging";
import SlashCommandHandler from "@lib/handlers/SlashCommandHandler";
import EventHandler from "@lib/handlers/EventHandler";
import BotConfig, { Folders } from "@lib/configs/BotConfig";
import { databaseConfig } from "@src/config";
import { DatabaseHandler } from "@lib/handlers/DatabaseHandler";
import ComponentHandler from "./handlers/ComponentHandler";

export default class Bot {
    /** Discord Client */
    public client: Client;

    /** REST instance */
    public rest: REST;

    /** Bot Config */
    public config: BotConfig;

    /** Folder Paths */
    public folders: Folders;

    /** Logging Library */
    public logger: Logger;

    /** Command Handler */
    public commands: SlashCommandHandler;

    /** Event Handler */
    public events: EventHandler;

    /** Component Handler */
    public components: ComponentHandler;

    /** Database Handler */
    public database: DatabaseHandler;

    /** Discord Text Channel to Post Bot Logs */
    public developerConsoleChannel: TextChannel;

    constructor(client: Client, config: BotConfig, rootFolder: string) {
        this.client = client;

        this.config = config;

        this.folders = {
            root: rootFolder,
            logs: path.join(rootFolder, "logs"),
            commands: path.join(rootFolder, "commands"),
            events: path.join(rootFolder, "events"),
            components: path.join(rootFolder, "components"),
            lib: path.join(rootFolder, "lib"),
        };

        this.rest = new REST().setToken(this.config.token);
        this.logger = new Logger(this.folders.logs, this);

        this.commands = new SlashCommandHandler(this);
        this.events = new EventHandler(this);
        this.components = new ComponentHandler(this);
        this.database = new DatabaseHandler(this, databaseConfig);
    }

    /**
     * Loads all handlers: Commands, Events, Components, etc.
     * @param sendLog boolean = true
     * @returns Promise (void)
     */
    private async loadHandlers(sendLog: boolean = true) {
        if (sendLog) await this.logger.bot("Loading handlers.");

        await this.events.populateAndRegisterCache();
        await this.commands.populateCache();
        await this.commands.registerCommandsWithDiscordAPI();
        await this.components.load();

        if (sendLog) await this.logger.bot("Loaded handlers.", true);
    }

    /**
     * Unloads all handlers: Commands, Events, Components, etc.
     * @param sendLog boolean = true
     * @returns Promise (void)
     */
    private async unloadHandlers(sendLog: boolean = true) {
        if (sendLog) await this.logger.bot("Unloading handlers.");

        await this.events.deleteCacheGroup();
        await this.events.deregisterCacheGroup();
        await this.commands.deleteCacheGroup();
        await this.commands.deregisterCommandsWithDiscordAPI();
        await this.components.unload();

        if (sendLog) await this.logger.bot("Unloaded handlers.");
    }

    /**
     * Unloads & reloads all handlers: Commands, Events, Components, etc.
     * @returns Promise (voids)
     */
    public async reloadHandlers() {
        await this.logger.bot("Reloading all handlers...");

        await this.unloadHandlers(false);
        await this.loadHandlers(false);

        await this.logger.bot("Reloaded all handlers.", true);
    }

    /**
     * Login to Discord API & database
     * @param loadEvents boolean = true
     * @returns Promise (void)
     */
    public async start(loadEvents: boolean = true) {
        if (loadEvents) await this.loadHandlers();

        await this.logger.bot("Logging into Discord...");
        await this.client.login(this.config.token);

        await this.database.connect();
    }

    /**
     * Logout from Discord API & database
     * @returns Promise (void)
     */
    public async logout() {
        const tag = this.client.user?.tag;

        await this.logger.bot(`Logging out of client '${tag}'.`);
        await this.client.destroy();
        await this.logger.bot(`Logged out of client '${tag}'.`, true);

        await this.database.disconnect();
    }

    /**
     * Logout from Discord API and stop node process.
     * @param Object \{ unload: boolean = false, exitCode: number = 0 }
     * @returns Promise (void)
     */
    public async shutdown({ unload = false, exitCode = 0 }) {
        if (unload) await this.unloadHandlers();
        await this.logout();

        await this.logger.bot(`Shutting down.`);
        await process.exit(exitCode);
        return;
    }

    /**
     * Logout from Discord API, reload handlers, login to Discord API.
     * @returns Promise (void)
     */
    public async restart() {
        await this.logout();
        await this.reloadHandlers();
        await this.start(false);
    }
}
