import { Router } from "express";
import { createSession, sendMessage, getSessionHistory, getUserSessions } from "../controllers/chatController";
import { auth } from "../middlewares/auth";

const router = Router();

// Create a new chat session
router.post("/sessions", auth, createSession);

// Send a message to a session (requires auth)
router.post("/sessions/:sessionId/messages", auth, sendMessage);

// Get session history (requires auth)
router.get("/sessions/:sessionId/history", auth, getSessionHistory);

// Get all sessions for the authenticated user
router.get("/sessions", auth, getUserSessions);

export default router;

