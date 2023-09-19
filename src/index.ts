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

import { Client, GatewayIntentBits } from "discord.js";
import { config } from "@src/config";
import Bot from "@src/lib/bot";

const bot = new Bot(
    new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers,
        ],
    }),
    config,
    __dirname,
);

export default bot;

bot.start(true).catch((error) => bot.logger.error(error));
