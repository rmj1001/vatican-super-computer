import { Collection } from "discord.js";
import * as path from "path";
import Bot from "@src/lib/bot";
import { getFilesRecursive } from "@lib/fs";

export interface ComponentHelp {
    name: string;
    description: string;
    category?: string;
}

export interface Component {
    data: any;
    help: ComponentHelp;
    execute: Function;
}

interface ComponentCache {
    cache: Collection<string, Component>;
    files: string[];
    filePaths: string[];
    JSONs: any[];
}

export default class ComponentHandler {
    public bot: Bot;

    public buttons: ComponentCache;
    public actionRows: ComponentCache;

    constructor(bot: Bot) {
        this.bot = bot;

        this.buttons = {
            cache: new Collection(),
            files: [],
            filePaths: [],
            JSONs: [],
        };

        this.actionRows = {
            cache: new Collection(),
            files: [],
            filePaths: [],
            JSONs: [],
        };
    }

    async populateCache() {
        const folderContents: string[] = getFilesRecursive(
            this.bot.folders.components,
        );

        if (!folderContents) return;
        if (folderContents.length < 1) return;

        for (const file of folderContents) {
            const filePath = path.join(this.bot.folders.components, file);
            const component = require(filePath);

            if (!("data" in component)) {
                this.bot.logger.warn(
                    `The component ${filePath} is missing a required 'data' property.`,
                );
            }

            if (!("execute" in component)) {
                this.bot.logger.warn(
                    `The component ${filePath} is missing a required 'execute' property.`,
                );
            }

            component.data.path = filePath;
            let category: ComponentCache;

            switch (component.help.category) {
                case "button":
                    category = this.buttons;
                    break;
                case "action-rows":
                    category = this.actionRows;
                    break;
                default: {
                    this.bot.logger.error(
                        `Invalid component category for '${component.help.name}'.`,
                    );
                    break;
                }
            }

            category.filePaths.push(filePath);
            category.cache.set(component.data.name, component);
            category.JSONs.push(component.data.toJSON());
        }
    }

    async deleteCache(component: string) {
        const actionRows = this.actionRows.cache.find(
            (cmd) => cmd.data.name === component,
        );
        const buttons = this.buttons.cache.find(
            (cmd) => cmd.data.name === component,
        );

        if (!actionRows && !buttons) return;

        if (actionRows) {
            component = actionRows.data.name;

            delete require[require.resolve(actionRows.data.path)];
            this.actionRows.cache.delete(component);
        }

        if (buttons) {
            component = buttons.data.name;

            delete require[require.resolve(buttons.data.path)];
            this.buttons.cache.delete(component);
        }

        this.bot.logger.component(
            `Successfully deleted component '${component}' from the cache.`,
            true,
        );
    }

    async deleteCacheGroup(type: "action-rows" | "buttons" | "all" = "all") {
        const deleteButtons = () => {
            this.buttons.filePaths.forEach((file) => {
                delete require[require.resolve(file)];
                this.bot.logger.component(
                    `Successfully deleted component file '${file}' from the cache.`,
                    true,
                );
            });

            this.buttons.files = [];
            this.buttons.filePaths = [];
            this.buttons.JSONs = [];
            this.buttons.cache = new Collection();
        };

        const deleteActionRows = () => {
            this.actionRows.filePaths.forEach((file) => {
                delete require[require.resolve(file)];
                this.bot.logger.component(
                    `Successfully deleted component file '${file}' from the cache.`,
                    true,
                );
            });

            this.actionRows.files = [];
            this.actionRows.filePaths = [];
            this.actionRows.JSONs = [];
            this.actionRows.cache = new Collection();
        };

        switch (type) {
            case "buttons":
                await deleteActionRows();
                break;
            case "action-rows":
                await deleteButtons();
                break;
            case "all":
                await deleteActionRows();
                await deleteButtons();
                break;
        }
    }

    async load() {
        await this.populateCache();
    }

    async unload() {
        await this.deleteCacheGroup();
    }

    async reload() {
        await this.unload();
        await this.load();
    }
}
