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

import BotConfig from "@lib/configs/BotConfig";
import DatabaseConfig from "@lib/configs/DatabaseConfig";

export const config: BotConfig = {
    token: "",
    inviteURL: "",
    developerGuildURL: "",
    developers: [], // discord user id's
    botUserID: "",
    developerGuildID: "",
    developerLogChannelID: "",

    userOnline: "dnd",
    userStatuses: ["beep boop"],

    description: "",
};

/**
 * Used only with Mongoose/MongoDB
 */
export const databaseConfig: DatabaseConfig = {
    connectionString: "",
};
