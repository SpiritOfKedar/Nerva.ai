import rateLimit from "express-rate-limit";
import { Request } from "express";

// Rate limiter for authentication endpoints (stricter)
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window per IP
    message: {
        error: "Too many authentication attempts. Please try again in 15 minutes.",
        retryAfter: 15 * 60,
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        return req.ip || req.socket.remoteAddress || "unknown";
    },
});

// Rate limiter for chat endpoints (moderate)
export const chatRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 messages per minute per user
    message: {
        error: "You're sending messages too quickly. Please slow down.",
        retryAfter: 60,
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        // Use user ID if authenticated, otherwise fall back to IP
        return (req as any).user?._id?.toString() || req.ip || req.socket.remoteAddress || "unknown";
    },
});

// General API rate limiter
export const generalRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute per IP
    message: {
        error: "Too many requests. Please try again later.",
        retryAfter: 60,
    },
    standardHeaders: true,
    legacyHeaders: false,
});
