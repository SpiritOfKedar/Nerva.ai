import { Request, Response } from "express";
import { logger } from "../utils/logger";
import { ChatMessage } from "../models/ChatMessage";
import { ChatSessionModel } from "../models/ChatSession";

// System prompt for natural, high-quality therapeutic responses
const SYSTEM_PROMPT = `You are Nerva, a skilled therapist having a real conversation. Respond like a warm, experienced professional who genuinely cares.

CRITICAL RULES:
1. NO TEMPLATES - Never use numbered sections, headers, or formulaic structures. Just talk naturally.
2. ACTUALLY LISTEN - Respond to what they SPECIFICALLY said, not generic anxiety/stress advice.
3. BE CONCISE - 3-5 sentences max unless they ask for more detail. Quality over quantity.
4. ONE TECHNIQUE MAX - If you offer a technique, make it ONE that directly fits their situation.
5. ASK QUESTIONS - Show curiosity. Ask about THEIR specific situation, not generic follow-ups.

HOW TO RESPOND:

Instead of: "I hear that you're feeling anxious. Anxiety is natural. Try this breathing exercise..."
Do this: "That fear of messing up in the interview - I get it. What specifically are you worried you'll mess up on? The technical questions, or more how you'll come across?"

Instead of: Generic 5-4-3-2-1 grounding every time
Do this: Address THEIR specific worry. If they're scared about an interview, talk about interview prep, reframing "perfection", or what's really at stake.

WHAT MAKES A GREAT RESPONSE:
- Picks up on specific words they used
- Asks a question that shows you're curious about THEIR situation  
- Offers insight that's actually relevant to what they said
- Feels like talking to a smart friend who happens to be a therapist
- Makes them feel understood, not lectured at

AVOID:
- "It's completely natural to feel..."
- Numbered lists of steps
- Generic breathing exercises unless they ask
- Long explanations of why anxiety happens
- Sounding like a self-help book

FOR CRISIS (suicidal thoughts, self-harm):
Be direct but warm: "I'm concerned about what you're sharing. Are you safe right now?" Then offer 988 (call/text) naturally, not as a list.

You're having a real conversation. Be present. Be curious. Be helpful.`;

// Analyze emotional state from message content
const analyzeEmotionalState = (message: string): {
    emotionalState: string;
    riskLevel: number;
    themes: string[];
} => {
    const lowerMessage = message.toLowerCase();
    const themes: string[] = [];
    let riskLevel = 0;
    let emotionalState = "neutral";

    // Detect emotional themes
    if (/anxi|worr|nervous|stress|panic|fear/i.test(message)) {
        themes.push("anxiety");
        emotionalState = "anxious";
    }
    if (/sad|depress|down|hopeless|empty|lonely/i.test(message)) {
        themes.push("depression");
        emotionalState = "sad";
        riskLevel += 1;
    }
    if (/angry|frustrat|annoy|upset|mad/i.test(message)) {
        themes.push("anger");
        emotionalState = "frustrated";
    }
    if (/happy|good|great|better|excited|joy/i.test(message)) {
        themes.push("positive");
        emotionalState = "positive";
    }
    if (/sleep|insomnia|tired|exhaust/i.test(message)) {
        themes.push("sleep");
    }
    if (/work|job|career|boss|colleague/i.test(message)) {
        themes.push("work-stress");
    }
    if (/relationship|partner|family|friend/i.test(message)) {
        themes.push("relationships");
    }
    if (/overwhelm|too much|can't cope|breaking/i.test(message)) {
        themes.push("overwhelm");
        riskLevel += 1;
    }

    // Detect high-risk indicators
    if (/suicid|kill myself|end it|don't want to live|want to die/i.test(message)) {
        themes.push("crisis");
        emotionalState = "crisis";
        riskLevel = 10;
    }
    if (/self.?harm|hurt myself|cutting/i.test(message)) {
        themes.push("self-harm");
        riskLevel = Math.max(riskLevel, 8);
    }
    if (/worthless|no point|burden|everyone.*better.*without/i.test(message)) {
        riskLevel = Math.max(riskLevel, 6);
    }

    return { emotionalState, riskLevel, themes };
};

// Determine therapeutic technique based on context
const selectTechnique = (themes: string[], riskLevel: number): { technique: string; goal: string } => {
    if (riskLevel >= 8) {
        return { technique: "Crisis Support", goal: "Safety and immediate support" };
    }
    if (themes.includes("anxiety")) {
        return { technique: "Grounding & Mindfulness", goal: "Reduce anxiety and promote calm" };
    }
    if (themes.includes("depression")) {
        return { technique: "Cognitive Behavioral", goal: "Identify and challenge negative thoughts" };
    }
    if (themes.includes("anger") || themes.includes("frustration")) {
        return { technique: "Emotional Regulation", goal: "Process and manage strong emotions" };
    }
    if (themes.includes("relationships")) {
        return { technique: "Interpersonal", goal: "Explore relationship dynamics" };
    }
    if (themes.includes("overwhelm")) {
        return { technique: "Problem Solving", goal: "Break down challenges into manageable steps" };
    }
    return { technique: "Empathetic Listening", goal: "Provide support and understanding" };
};

// Create a new chat session
export const createSession = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Generate a unique session ID
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create session in database
        const chatSession = new ChatSessionModel({
            sessionId,
            userId,
            title: "New Therapy Session",
            lastMessageAt: new Date(),
            messageCount: 0,
            isActive: true,
        });
        await chatSession.save();

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
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!message || typeof message !== "string" || message.trim().length === 0) {
            return res.status(400).json({ error: "Message is required" });
        }

        // Sanitize message
        const sanitizedMessage = message.trim().substring(0, 5000);

        logger.info(`Received message for session ${sessionId} from user ${userId}`);

        // Analyze the message
        const analysis = analyzeEmotionalState(sanitizedMessage);
        const { technique, goal } = selectTechnique(analysis.themes, analysis.riskLevel);

        // Save user message to database
        const userMessageDoc = new ChatMessage({
            sessionId,
            userId,
            role: "user",
            content: sanitizedMessage,
            metadata: {
                emotionalState: analysis.emotionalState,
                riskLevel: analysis.riskLevel,
                themes: analysis.themes,
            },
            timestamp: new Date(),
        });
        await userMessageDoc.save();

        // Fetch conversation history for context
        const history = await ChatMessage.find({ sessionId })
            .sort({ timestamp: -1 })
            .limit(10)
            .lean();

        const conversationContext = history
            .reverse()
            .map(msg => `${msg.role === "user" ? "User" : "Nerva"}: ${msg.content}`)
            .join("\n\n");

        // Build the prompt with context
        let contextualPrompt = SYSTEM_PROMPT;

        // Add crisis resources if risk level is high
        if (analysis.riskLevel >= 6) {
            contextualPrompt += `\n\n**IMPORTANT**: The user may be experiencing distress. Be especially gentle and mention support resources naturally.`;
        }

        contextualPrompt += `\n\n## Recent Conversation:\n${conversationContext}\n\nUser's latest message: "${sanitizedMessage}"\n\n`;
        contextualPrompt += `Detected emotional state: ${analysis.emotionalState}\nThemes: ${analysis.themes.join(", ") || "general"}\n\n`;
        contextualPrompt += `Provide a therapeutic response using ${technique} approach. Goal: ${goal}. Be warm, conversational, and supportive.`;

        // Generate AI response
        let aiResponseText = "";
        try {
            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
            const model = genAI.getGenerativeModel({
                model: "gemini-3-flash-preview",
                generationConfig: {
                    temperature: 0.8,
                    topP: 0.95,
                    topK: 40,
                    maxOutputTokens: 1024,
                }
            });

            const result = await model.generateContent(contextualPrompt);
            aiResponseText = result.response.text().trim();
        } catch (aiError) {
            logger.error("Gemini API Error:", aiError);
            // Empathetic fallback response
            if (analysis.riskLevel >= 6) {
                aiResponseText = "I want you to know that I'm here for you, and what you're feeling matters. While I'm having some technical difficulties right now, please know that support is available. If you're in crisis, please reach out to the National Suicide Prevention Lifeline at 988, or text HOME to 741741 for the Crisis Text Line. I'll be back to full capacity soon. 💚";
            } else {
                aiResponseText = "I'm here to listen and support you. I'm experiencing a brief technical moment, but that doesn't change how much I want to help. Please continue sharing - your thoughts and feelings are important, and I'll respond as soon as I can. 💚";
            }
        }

        // Save AI response to database
        const aiMessageDoc = new ChatMessage({
            sessionId,
            userId,
            role: "assistant",
            content: aiResponseText,
            metadata: {
                technique,
                goal,
                emotionalState: analysis.emotionalState,
                riskLevel: analysis.riskLevel,
                themes: analysis.themes,
            },
            timestamp: new Date(),
        });
        await aiMessageDoc.save();

        // Update session metadata
        await ChatSessionModel.findOneAndUpdate(
            { sessionId },
            {
                $inc: { messageCount: 2 },
                $set: { lastMessageAt: new Date() }
            }
        );

        const aiResponse = {
            role: "assistant",
            content: aiResponseText,
            timestamp: new Date().toISOString(),
            metadata: {
                technique,
                goal,
                emotionalState: analysis.emotionalState,
            }
        };

        return res.status(200).json({
            userMessage: {
                role: "user",
                content: sanitizedMessage,
                timestamp: userMessageDoc.timestamp.toISOString(),
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
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        logger.info(`Fetching history for session: ${sessionId}`);

        // Verify session belongs to user
        const session = await ChatSessionModel.findOne({ sessionId, userId });
        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        // Fetch messages
        const messages = await ChatMessage.find({ sessionId, userId })
            .sort({ timestamp: 1 })
            .lean();

        const formattedMessages = messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            metadata: msg.metadata,
        }));

        return res.status(200).json(formattedMessages);
    } catch (error) {
        logger.error("Error fetching session history:", error);
        return res.status(500).json({ error: "Failed to fetch session history" });
    }
};

// Get all sessions for a user
export const getUserSessions = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const sessions = await ChatSessionModel.find({ userId, isActive: true })
            .sort({ lastMessageAt: -1 })
            .limit(50)
            .lean();

        const formattedSessions = sessions.map(session => ({
            sessionId: session.sessionId,
            title: session.title,
            lastMessageAt: session.lastMessageAt,
            messageCount: session.messageCount,
        }));

        return res.status(200).json(formattedSessions);
    } catch (error) {
        logger.error("Error fetching user sessions:", error);
        return res.status(500).json({ error: "Failed to fetch sessions" });
    }
};
