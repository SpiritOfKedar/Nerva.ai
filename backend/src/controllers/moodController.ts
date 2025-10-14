import { Request,Response,NextFunction } from "express";

import { Mood } from "../models/mood";
import { logger } from "../utils/logger";
import { log } from "winston";
export const createMood = async(
    req:Request,
    res:Response,
    next:NextFunction
)=>{
    try {
        const {score,note,context,activities} = req.body;
        const userId = req.user?.id;
        if(!userId){
            return res.status(401).json({message:"Unauthorized"});
        }
        const mood = await Mood.create({
            score,
            note,
            context,
            activities,
            userId,
            timestamp: new Date()
        });
        await mood.save({validateBeforeSave:true});
        logger.info(`Mood created for user ${userId} with score ${score}`);


        return res.status(201).json(mood);
    } catch (error) {
        next(error);
    }
}