"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMood = void 0;
const mood_1 = require("../models/mood");
const logger_1 = require("../utils/logger");
const createMood = async (req, res, next) => {
    try {
        const { score, note, context, activities } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const mood = await mood_1.Mood.create({
            score,
            note,
            context,
            activities,
            userId,
            timestamp: new Date()
        });
        await mood.save({ validateBeforeSave: true });
        logger_1.logger.info(`Mood created for user ${userId} with score ${score}`);
        return res.status(201).json(mood);
    }
    catch (error) {
        next(error);
    }
};
exports.createMood = createMood;
