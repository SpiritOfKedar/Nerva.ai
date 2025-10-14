"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../utils/logger");
const users_1 = require("../models/users");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer", "");
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "my key");
        const user = await users_1.User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = user;
        next();
    }
    catch (error) {
        logger_1.logger.error("error while authenticating token");
        return res.status(500).json({ message: "could not authenticate token" });
    }
};
exports.auth = auth;
