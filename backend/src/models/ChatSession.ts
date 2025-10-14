import { IChatMessage } from "./chat";
import mongoose,{Document,Schema} from "mongoose";
import { chatMessageSchema } from "./chat";
export interface IChatSession extends Document{
    sessionId:string;
    messages:IChatMessage[];
    createdAt:Date;
    updatedAt:Date;
}
const chatSessionSchema = new Schema<IChatSession>(
    {
        sessionId:{type:String,required:true,unique:true},
        messages:[chatMessageSchema],
    },
    {timestamps:true}
);
export const ChatSession = mongoose.model<IChatSession>("ChatSession",chatSessionSchema); 