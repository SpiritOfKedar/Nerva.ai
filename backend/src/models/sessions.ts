import mongoose,{Document,Mongoose,Schema} from "mongoose";

export interface ISession extends Document{
    userId:mongoose.Types.ObjectId;
    token:string;
    expiresAt:Date;
    deviceInfo?:string;
    lastActive:Date
};
const sessionSchema = new Schema<ISession>(
    {
        userId:{type:Schema.Types.ObjectId, ref:"User",required:true},
        token:{type:String, required:true, unique:true},
        expiresAt:{type:Date,requird:true},
        deviceInfo:{type:String},
        lastActive:{type:Date,default:Date.now}
    },
    {timestamps:true}
);
sessionSchema.index({expiresAt:1},{expireAfterSeconds:0});
export const Session = mongoose.model<ISession>("Session",sessionSchema); 