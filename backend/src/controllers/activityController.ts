import { Request, Response, NextFunction } from "express";
import { Activity } from "../models/Activity";
import { IActivity } from "../models/Activity";
import { logger } from "../utils/logger";
export const logActivity = async (req:Request, res:Response,next:NextFunction)=>{
    try {
        const {type,name,description,duration,difficulty, feedback}=req.body;
        const userId = req.user._id;
        if(!userId){
            return res.status(401).json({message:"Unauthorized"});
        }
        const activity = new Activity({userId,type,name,description,duration,difficulty,feedback,timestamp:new Date()});
        await activity.save();
        logger.info(`Activity logged for user ${userId}: ${type} - ${name}`);
        res.status(201).json({activity}); 
    } catch (error) {
        logger.error("error while logging activity");
        next(error);
    }
};
