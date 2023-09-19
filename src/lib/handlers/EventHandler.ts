import { Collection } from "discord.js";
import * as path from "path";
import Bot from "@src/lib/bot";
import { EnumMember } from "typescript";
import { EventEmitter } from "node:events";
import { getFilesRecursive } from "@lib/fs";

export interface Event {
    name: string | EnumMember;
    path?: string;
    once: boolean;
    execute: Function;
}

export interface EventCache {
    cache: Collection<string, Event>;
    rootPath: string;
    files: string[];
    filePaths: string[];
    names: string[];
}

export default class EventHandler {
    eventsCache: Collection<string, Event>;
    eventsPath: string;
    eventFiles: string[];
    bot: Bot;
    emitter: EventEmitter;

    discord: EventCache;
    node: EventCache;

    constructor(bot: Bot) {
        this.bot = bot;
        this.emitter = new EventEmitter();

        this.discord = {
            cache: new Collection(),
            rootPath: path.join(bot.folders.events, "discord"),
            files: [],
            filePaths: [],
            names: [],
        };

        this.node = {
            cache: new Collection(),
            rootPath: path.join(bot.folders.events, "node"),
            files: [],
            filePaths: [],
            names: [],
        };
    }

    async populateAndRegisterCache(type: "discord" | "node" | "all" = "all") {
        const populateDiscordCache = async () => {
            this.discord.files = getFilesRecursive(
                this.discord.rootPath,
            )?.filter((file) => file.endsWith("ts"));

            if (this.discord.files?.length > 0)
                for (const file of this.discord.files) {
                    const filePath = path.join(this.discord.rootPath, file);
                    const event = require(filePath);
                    event.path = filePath;
                    this.discord.names.push(event.name);

                    if (event.once) {
                        this.bot.client.once(event.name, (...args) =>
                            event.execute(...args),
                        );
                    } else {
                        this.bot.client.on(event.name, (...args) =>
                            event.execute(...args),
                        );
                    }

                    this.bot.logger.event(
                        `Successfully loaded BOT event '${event.name}'.`,
                        true,
                    );
                }
        };

        const populateNodeCache = async () => {
            this.node.files = getFilesRecursive(this.node.rootPath)?.filter(
                (file) => file.endsWith("ts"),
            );

            if (this.node.files?.length > 1)
                for (const file of this.node.files) {
                    const filePath = path.join(this.node.rootPath, file);
                    const event = require(filePath);
                    event.path = filePath;
                    this.node.names.push(event.name);

                    if (event.once) {
                        this.emitter.once(event.name, (...args) =>
                            event.execute(...args),
                        );
                    } else {
                        this.emitter.on(event.name, (...args) =>
                            event.execute(...args),
                        );
                    }

                    this.bot.logger.event(
                        `Successfully loaded NODE event '${event.name}'.`,
                        true,
                    );
                }
        };

        switch (type) {
            case "discord":
                await populateDiscordCache();
                break;
            case "node":
                await populateNodeCache();
                break;
            case "all":
                await populateDiscordCache();
                populateNodeCache();
                break;
        }
    }

    async deleteCacheGroup(type: "discord" | "node" | "all" = "all") {
        const removeDiscordCache = async () => {
            await this.discord.cache.forEach((event) => {
                delete require[require.resolve(event.path)];
                this.bot.logger.event(
                    `Successfully deleted DISCORD event '${event.name}' from the cache.`,
                    true,
                );
            });
        };

        const removeNodeCache = async () => {
            this.node.cache.forEach((event) => {
                delete require[require.resolve(event.path)];
                this.bot.logger.event(
                    `Successfully deleted NODE event '${event.name}' from the cache.`,
                    true,
                );
            });
        };

        switch (type) {
            case "discord":
                await removeDiscordCache();
                break;
            case "node":
                await removeNodeCache();
                break;
            case "all":
                await removeDiscordCache();
                removeNodeCache();
                break;
        }
    }

    async deregisterCacheGroup(type: "discord" | "node" | "all" = "all") {
        const removeDiscordListeners = async () => {
            await this.discord.names.forEach(async (name) => {
                await this.bot.client.removeAllListeners(name);
            });
        };

        const removeNodeListeners = async () => {
            await this.node.names.forEach(async (name) => {
                await this.emitter.removeAllListeners(name);
            });
        };

        switch (type) {
            case "discord":
                await removeDiscordListeners();
                break;
            case "node":
                await removeNodeListeners();
                break;
            case "all":
                await removeDiscordListeners();
                await removeNodeListeners();
                break;
        }
    }
}
