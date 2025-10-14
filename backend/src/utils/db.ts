import mongoose from "mongoose";
import {logger} from "./logger";
import dotenv from "dotenv"
dotenv.config();

const mongodb_url = process.env.DB_URL;
if (!mongodb_url) {
    throw new Error("DB_URL is not defined in environment variables");
}

export const connectDb =async ()=>{
    try {
        await mongoose.connect(mongodb_url);
        logger.info("connected to mongodb atlas");
    } catch (error) {
        logger.error("error connecting db");
        process.exit(1);
    }
}