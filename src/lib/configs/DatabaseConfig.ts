import mongoose from "mongoose";

export default interface DatabaseConfig {
    connectionString: string;
    db?: mongoose.Connection;
}
