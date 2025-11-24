import { Request, Response } from "express";
import { logger } from "../utils/logger";

// Create a new chat session
export const createSession = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Generate a simple session ID
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        logger.info(`Created new chat session: ${sessionId} for user: ${userId}`);

        return res.status(201).json({
            sessionId,
            userId,
            createdAt: new Date().toISOString(),
        });
    } catch (error) {
        logger.error("Error creating chat session:", error);
        return res.status(500).json({ error: "Failed to create chat session" });
    }
};

// Send a message and get AI response
export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        logger.info(`Received message for session ${sessionId}: ${message}`);

        // Trigger Inngest function for AI processing
        const { inngest } = await import("../inngest/client");

        const systemPrompt = `You are Nerva AI, an empathetic mental health companion. Your role is to:
        - Provide supportive, non-judgmental responses
        - Use evidence-based therapeutic techniques (CBT, mindfulness, etc.)
        - Maintain professional boundaries
        - Prioritize user safety and well-being
        - Be warm, understanding, and encouraging
        
        Always respond with empathy and validate the user's feelings.`;

        // Send event to Inngest for processing
        await inngest.send({
            name: "therapy/session.message",
            data: {
                sessionId,
                message,
                history: [], // TODO: Fetch from database
                memory: {
                    userProfile: {
                        emotionalState: [],
                        riskLevel: 0,
                        preferences: {},
                    },
                    sessionContext: {
                        conversationThemes: [],
                        currentTechnique: null,
                    },
                },
                goals: [],
                systemPrompt,
            },
        });

        // For now, we'll use a synchronous approach
        // In production, you'd want to use webhooks or polling for the Inngest result
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        // Use gemini-2.5-flash as it is the current stable model
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `${systemPrompt}

User message: "${message}"

Provide a therapeutic response that is empathetic, supportive, and helpful. Keep it conversational and warm.`;

        let aiResponseText = "";
        try {
            const result = await model.generateContent(prompt);
            aiResponseText = result.response.text().trim();
        } catch (aiError) {
            logger.error("Gemini API Error:", aiError);
            // Fallback response if AI fails (e.g. quota exceeded)
            aiResponseText = "I'm currently experiencing high traffic, but I'm here to listen. Please tell me more about how you're feeling, and I'll do my best to support you.";
        }

        const aiResponse = {
            role: "assistant",
            content: aiResponseText,
            timestamp: new Date().toISOString(),
            metadata: {
                technique: "Empathetic Listening",
                goal: "Support and Understanding"
            }
        };

        return res.status(200).json({
            userMessage: {
                role: "user",
                content: message,
                timestamp: new Date().toISOString(),
            },
            aiMessage: aiResponse,
        });
    } catch (error) {
        logger.error("Error sending message:", error);
        return res.status(500).json({ error: "Failed to send message" });
    }
};

// Get session history
export const getSessionHistory = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;

        logger.info(`Fetching history for session: ${sessionId}`);

        // For now, return empty history
        // TODO: Implement session storage
        return res.status(200).json([]);
    } catch (error) {
        logger.error("Error fetching session history:", error);
        return res.status(500).json({ error: "Failed to fetch session history" });
    }
};
