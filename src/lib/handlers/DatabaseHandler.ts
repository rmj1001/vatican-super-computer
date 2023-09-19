import mongoose from "mongoose";
import DatabaseConfig from "@lib/configs/DatabaseConfig";
import Bot from "@src/lib/bot";

export class DatabaseHandler {
    public bot: Bot;
    public db: Promise<typeof mongoose> | void;
    public config: DatabaseConfig;

    constructor(bot: Bot, config: DatabaseConfig) {
        this.bot = bot;
        this.config = config;
    }

    public async connect() {
        await this.bot.logger.database("Connecting to database...");
        this.db = await mongoose
            .connect(this.config.connectionString)
            .then(() => {
                this.bot.logger.database("Connected to database!", true);
            })
            .catch((error) => {
                this.bot.logger.fatal("Couldn't connect to database: ", error);
            });
    }

    public async disconnect() {
        await this.bot.logger.database("Disconnecting from database...");
        await mongoose.connection
            .close()
            .then(async () => {
                await this.bot.logger.database(
                    "Disconnected from database.",
                    true,
                );
            })
            .catch(async (error) => {
                await this.bot.logger.fatal(
                    "Failed to disconnect from database.",
                    error,
                );
            });
    }
}
