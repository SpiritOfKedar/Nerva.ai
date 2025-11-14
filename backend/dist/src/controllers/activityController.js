"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = void 0;
const Activity_1 = require("../models/Activity");
const logger_1 = require("../utils/logger");
const logActivity = async (req, res, next) => {
    try {
        const { type, name, description, duration, difficulty, feedback } = req.body;
        const userId = req.user._id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const activity = new Activity_1.Activity({ userId, type, name, description, duration, difficulty, feedback, timestamp: new Date() });
        await activity.save();
        logger_1.logger.info(`Activity logged for user ${userId}: ${type} - ${name}`);
        res.status(201).json({ activity });
    }
    catch (error) {
        logger_1.logger.error("error while logging activity");
        next(error);
    }
};
exports.logActivity = logActivity;
