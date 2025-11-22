import { Request, Response } from "express";
import { User } from "../models/users";
import { Session } from "../models/sessions";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger";
import dotenv from "dotenv";
dotenv.config();
export const register = async (req: Request, res: Response) => {
    try {
        const { email, name, password } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ message: "all fields are required" });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exist" });
        }
        const hasehdPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hasehdPassword });
        await user.save();
        res.status(201).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            },
            message: "User registered succesfully"

        });
    } catch (error) {
        logger.error("error in registering user");
        return res.status(500).json({
            message: "could not register user"
        })
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "all fields are required"
            })
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "no user registered with provided email" });
        }
        //confirm the password matches
        const isPasswordVaild = await bcrypt.compare(password, user.password);
        if (!isPasswordVaild) {
            return res.status(401).json({ message: "Invaild password" });
        }
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || "my key",
            { expiresIn: "24h" }
        );
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        const session = new Session({
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
    } catch (error) {
        logger.error("error while logging in user");
        return res.status(500).json({ message: "could not log in user" })
    }
}
export const logout = async (req: Request, res: Response) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer", "");
        if (token) {
            await Session.findOneAndDelete({ token });
        }
        res.status(200).json({ message: "successfully logged out user" });
    } catch (error) {
        logger.error("error while logging out user");
        return res.status(500).json({ message: "could not log out user" })
    }
}