import mongoose,{Document,Schema} from "mongoose";
export interface IMood extends Document{
    userId:mongoose.Types.ObjectId;
    score:number;
    note?:string;
    timestamp:Date;
    createdAt:Date;     
    updatedAt:Date;
}
const moodSchema = new Schema<IMood>(
    {
        userId:{type:Schema.Types.ObjectId,ref:"User",required:true,index:true},
        score:{type:Number,min:0,max:100,required:true},
        note:{type:String,trim:true},
        timestamp:{type:Date,default:Date.now,required:true},
    },
    {timestamps:true}
);
moodSchema.index({userId:1,timestamp:-1});
export const Mood = mongoose.model<IMood>("Mood",moodSchema); 