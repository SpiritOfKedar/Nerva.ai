"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.register = void 0;
const users_1 = require("../models/users");
const sessions_1 = require("../models/sessions");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../utils/logger");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const register = async (req, res) => {
    try {
        const { email, name, password } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ message: "all fields are required" });
        }
        const existingUser = await users_1.User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exist" });
        }
        const hasehdPassword = await bcrypt_1.default.hash(password, 10);
        const user = new users_1.User({ name, email, password: hasehdPassword });
        await user.save();
        res.status(201).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            },
            message: "User registered succesfully"
        });
    }
    catch (error) {
        logger_1.logger.error("error in registering user");
        return res.status(500).json({
            message: "could not register user"
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "all fields are required"
            });
        }
        const user = await users_1.User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "no user registered with provided email" });
        }
        //confirm the password matches
        const isPasswordVaild = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordVaild) {
            return res.status(401).json({ message: "Invaild password" });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || "my key", { expiresIn: "24h" });
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        const session = new sessions_1.Session({
            userId: user._id,
            token,
            expiresAt,
            deviceInfo: req.headers["user-agent"]
        });
        await session.save();
        res.status(200).json({
            user: {
                userId: user._id,
                name: user.name,
                email: user.email
            },
            token,
            message: "successfully logged in user"
        });
    }
    catch (error) {
        logger_1.logger.error("error while logging in user");
        return res.status(500).json({ message: "could not log in user" });
    }
};
exports.login = login;
const logout = async (req, res) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer", "");
        if (token) {
            await sessions_1.Session.findOneAndDelete({ token });
        }
        res.status(200).json({ message: "successfully logged out user" });
    }
    catch (error) {
        logger_1.logger.error("error while logging out user");
        return res.status(500).json({ message: "could not log out user" });
    }
};
exports.logout = logout;
