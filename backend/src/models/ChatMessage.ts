import mongoose, { Document, Schema } from "mongoose";

export interface IChatMessage extends Document {
    sessionId: string;
    userId: mongoose.Types.ObjectId;
    role: "user" | "assistant";
    content: string;
    metadata?: {
        technique?: string;
        goal?: string;
        emotionalState?: string;
        riskLevel?: number;
        themes?: string[];
    };
    timestamp: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
    {
        sessionId: { type: String, required: true, index: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
        metadata: {
            technique: { type: String },
            goal: { type: String },
            emotionalState: { type: String },
            riskLevel: { type: Number, min: 0, max: 10 },
            themes: [{ type: String }],
        },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Compound index for efficient session history queries
chatMessageSchema.index({ sessionId: 1, timestamp: 1 });

// Index for user's message history
chatMessageSchema.index({ userId: 1, timestamp: -1 });

export const ChatMessage = mongoose.model<IChatMessage>("ChatMessage", chatMessageSchema);
