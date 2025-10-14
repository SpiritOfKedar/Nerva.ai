"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDb = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("./logger");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongodb_url = process.env.DB_URL;
if (!mongodb_url) {
    throw new Error("DB_URL is not defined in environment variables");
}
const connectDb = async () => {
    try {
        await mongoose_1.default.connect(mongodb_url);
        logger_1.logger.info("connected to mongodb atlas");
    }
    catch (error) {
        logger_1.logger.error("error connecting db");
        process.exit(1);
    }
};
exports.connectDb = connectDb;
