import { Router } from "express";
import { createSession, sendMessage, getSessionHistory } from "../controllers/chatController";
import { auth } from "../middlewares/auth";

const router = Router();

// Create a new chat session
router.post("/sessions", auth, createSession);

// Send a message to a session
router.post("/sessions/:sessionId/messages", sendMessage);

// Get session history
router.get("/sessions/:sessionId/history", getSessionHistory);

export default router;
