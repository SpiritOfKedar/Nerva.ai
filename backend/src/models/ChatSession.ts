import mongoose, { Document, Schema } from "mongoose";

export interface IChatSession extends Document {
    sessionId: string;
    userId: mongoose.Types.ObjectId;
    title?: string;
    lastMessageAt: Date;
    messageCount: number;
    isActive: boolean;
}

const chatSessionSchema = new Schema<IChatSession>(
    {
        sessionId: { type: String, required: true, unique: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        title: { type: String },
        lastMessageAt: { type: Date, default: Date.now },
        messageCount: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Index for efficient user session queries
chatSessionSchema.index({ userId: 1, lastMessageAt: -1 });

export const ChatSessionModel = mongoose.model<IChatSession>("ChatSession", chatSessionSchema);