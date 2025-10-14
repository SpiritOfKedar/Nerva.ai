import mongoose,{Document,Schema} from "mongoose";
//IActivity interface
export interface IActivity extends Document{
    userId:mongoose.Types.ObjectId;
    type:string;
    name:string;
    description:string;
    timestamp:Date;
    duration:number;
}
const activitySchema = new Schema<IActivity>(
    {
        userId:{type:Schema.Types.ObjectId, ref:"User",required:true,index:true},
        type:{type:String,required:true,num:["meditation","exercise","walking","reading","journaling","therapy"]
        },
        name:{type:String,required:true},
        description:{type:String},
        timestamp:{type:Date,required:true},
        duration:{type:Number,min:0,required:true},
    },
    {timestamps:true} 
);
activitySchema.index({userId:1,timestamp:-1});
export const Activity = mongoose.model<IActivity>("Activity",activitySchema);