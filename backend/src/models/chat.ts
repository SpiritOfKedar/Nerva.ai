import mongoose,{Document,Schema} from "mongoose";
export interface IChatMessage extends Document{
    role:"user" | "assistant";
    content:string;
    timestamp:Date;
    metadata?:{
        technique:string;
        goal:string;
        progress:any[];
    }
}



export const chatMessageSchema = new Schema<IChatMessage>(
    {
        role:{type:String,enum:["user","assistant"],required:true},
        content:{type:String,required:true},
        timestamp:{type:Date,default:Date.now,required:true},
        metadata:{
            technique:{type:String},
            goal:{type:String},
            progress:[Schema.Types.Mixed],
        },
    },
    {timestamps:true}
);

export const ChatMessage = mongoose.model<IChatMessage>("ChatMessage",chatMessageSchema); 