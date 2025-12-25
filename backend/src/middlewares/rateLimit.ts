import rateLimit from "express-rate-limit";

// Rate limiter for authentication endpoints (stricter)
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per window per IP (increased for development)
    message: {
        error: "Too many authentication attempts. Please try again in 15 minutes.",
        retryAfter: 15 * 60,
    },
    standardHeaders: true,
    legacyHeaders: false,
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
