import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Session } from "../models/Session";
import { logger } from "../utils/logger";
import { User } from "../models/User";
import dotenv from "dotenv";
dotenv.config();

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as JwtPayload;
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = user;
        next();
    } catch (error) {
        logger.error("error while authenticating token");
        return res.status(500).json({ message: "could not authenticate token" })
    }
}