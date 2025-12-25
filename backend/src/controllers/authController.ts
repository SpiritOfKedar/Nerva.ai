import { Request, Response } from "express";
import { User } from "../models/users";
import { Session } from "../models/sessions";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger";
import dotenv from "dotenv";
dotenv.config();

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation: 8+ chars, uppercase, lowercase, number
const validatePassword = (password: string): { valid: boolean; message: string } => {
    if (password.length < 8) {
        return { valid: false, message: "Password must be at least 8 characters long" };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: "Password must contain at least one uppercase letter" };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: "Password must contain at least one lowercase letter" };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: "Password must contain at least one number" };
    }
    return { valid: true, message: "" };
};
export const register = async (req: Request, res: Response) => {
    try {
        const { email, name, password } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate email format
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ message: passwordValidation.message });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(409).json({ message: "User already exist" });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword
        });
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
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (token) {
            await Session.findOneAndDelete({ token });
        }
        res.status(200).json({ message: "successfully logged out user" });
    } catch (error) {
        logger.error("error while logging out user");
        return res.status(500).json({ message: "could not log out user" })
    }
}