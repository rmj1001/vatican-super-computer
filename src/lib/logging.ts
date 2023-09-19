/***
 *                 _   _                   __                           ___                            _
 *     /\   /\__ _| |_(_) ___ __ _ _ __   / _\_   _ _ __   ___ _ __    / __\___  _ __ ___  _ __  _   _| |_ ___ _ __
 *     \ \ / / _` | __| |/ __/ _` | '_ \  \ \| | | | '_ \ / _ \ '__|  / /  / _ \| '_ ` _ \| '_ \| | | | __/ _ \ '__|
 *      \ V / (_| | |_| | (_| (_| | | | | _\ \ |_| | |_) |  __/ |    / /__| (_) | | | | | | |_) | |_| | ||  __/ |
 *       \_/ \__,_|\__|_|\___\__,_|_| |_| \__/\__,_| .__/ \___|_|    \____/\___/|_| |_| |_| .__/ \__,_|\__\___|_|
 *                                                 |_|                                    |_|
 *
 *
 * Author(s): Roy Conn
 * Organization:
 * Description:
 */

import Bot from "@lib/bot";
import chalk from "chalk";
import path from "path";
import fs from "fs";

export enum LogLevels {
    NONE = "none",
    SUCCESS = "success",
    WARNING = "warning",
    ERROR = "error",
    FATAL = "fatal",
}

export interface Log {
    description: string;
    prefix?: string;
    level?: LogLevels;
    error?: Error;
}

export default class Logger {
    private botClient: Bot;
    private logFolder: string;

    private logDateString: string;
    private logTimeString: string;
    public logFileName: string;

    public logFilePath: string;
    private logFileStream: fs.WriteStream;
    private logHeaderFilePath: string;
    private logHeader: Buffer | string;

    private date: Date;

    constructor(logFolder: string, botClient: Bot) {
        this.botClient = botClient;

        this.date = new Date();
        this.logFolder = logFolder;

        this.logDateString = `${this.date.getFullYear()}-${this.date.getMonth()}-${this.date.getDate()}`;
        this.logTimeString = `${this.date.getHours()}-${this.date.getMinutes()}-${this.date.getSeconds()}`;
        this.logFileName = `${this.logDateString} ${this.logTimeString}.log`;

        this.logFilePath = path.join(this.logFolder, this.logFileName);

        this.logFileStream = fs.createWriteStream(this.logFilePath, {
            flags: "w",
            encoding: "utf8",
            mode: 0o666,
        });

        this.logHeaderFilePath = path.join(
            this.botClient.folders.root,
            "header.txt",
        );

        this.logHeader = "";

        if (fs.existsSync(this.logHeaderFilePath)) {
            this.logHeader = fs.readFileSync(this.logHeaderFilePath);
            this.logFileStream.write(`${this.logHeader.toString()}\n\n`);
        }

        console.log(`${this.logHeader.toString()}\n\n`);
    }

    async createLogFolderIfNotExists() {
        await fs.exists(this.logFolder, (exists) => {
            if (exists) return;

            try {
                fs.mkdir(this.logFolder, (error) => {
                    console.log(error);
                    process.exit(1);
                });
            } catch (error) {
                console.error(error);
                process.exit(1);
            }
        });
    }

    async template({
        description,
        prefix = "log",
        level = LogLevels.NONE,
        error,
    }: Log) {
        await this.createLogFolderIfNotExists();

        const logString = `[${prefix.toUpperCase()}] ${description}\n`;

        switch (level) {
            case LogLevels.NONE:
                await console.log(logString);
                break;
            case LogLevels.SUCCESS:
                await console.log(chalk.greenBright(logString));
                break;
            case LogLevels.WARNING:
                await console.log(chalk.yellowBright(logString));
                break;
            case LogLevels.ERROR:
                await console.log(chalk.redBright(logString));
                break;
            case LogLevels.FATAL:
                await console.log(chalk.blackBright(logString));
                break;
            default:
                await console.log(logString);
                break;
        }

        await this.logFileStream.write(logString);

        if (error) {
            await console.error(error);
            await this.logFileStream.write(error);
        }
    }

    async log(description: string, success: boolean = false) {
        return await this.template({
            description,
            prefix: "log",
            level: success ? LogLevels.SUCCESS : LogLevels.NONE,
        });
    }

    async warn(description: string) {
        return await this.template({
            description,
            prefix: "warn",
            level: LogLevels.WARNING,
        });
    }

    async error(description: string, error?: Error) {
        await this.template({
            description,
            prefix: "error",
            level: LogLevels.ERROR,
            error,
        });
    }

    async fatal(description: string, error?: Error) {
        await this.template({
            description,
            prefix: "fatal",
            level: LogLevels.FATAL,
            error,
        });

        await this.botClient.shutdown({
            exitCode: 1,
        });
    }

    async debug(description: string) {
        return await this.template({
            description,
            prefix: "debug",
            level: LogLevels.NONE,
        });
    }

    async bot(description: string, success: boolean = false) {
        return await this.template({
            description,
            prefix: "bot",
            level: success ? LogLevels.SUCCESS : LogLevels.NONE,
        });
    }

    async api(description: string, success: boolean = false) {
        return await this.template({
            description,
            prefix: "api",
            level: success ? LogLevels.SUCCESS : LogLevels.NONE,
        });
    }

    async database(description: string, success: boolean = false) {
        return await this.template({
            description,
            prefix: "database",
            level: success ? LogLevels.SUCCESS : LogLevels.NONE,
        });
    }

    async command(description: string, success: boolean = false) {
        return await this.template({
            description,
            prefix: "command",
            level: success ? LogLevels.SUCCESS : LogLevels.NONE,
        });
    }

    async event(description: string, success: boolean = false) {
        return await this.template({
            description,
            prefix: "event",
            level: success ? LogLevels.SUCCESS : LogLevels.NONE,
        });
    }

    async component(description: string, success: boolean = false) {
        return await this.template({
            description,
            prefix: "component",
            level: success ? LogLevels.SUCCESS : LogLevels.NONE,
        });
    }
}
