import express from "express";
import { Request, Response } from "express";
import { serve } from "inngest/express";
import { inngest } from "./inngest/index";
import { functions as inngestFunctions } from "./inngest/functions";
import { logger } from "./utils/logger";
import dotenv, { config } from "dotenv";
import { connectDb } from "./utils/db";
dotenv.config()
import authRoutes from "./routes/auth";
import chatRoutes from "./routes/chat";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middlewares/errorHandler";
import { generalRateLimiter, authRateLimiter, chatRateLimiter } from "./middlewares/rateLimit";

// Configure allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3002",
    "http://localhost:3000",
    "https://nerva-ai-frontend.vercel.app"
];

//middlewares
const app = express();

// Security middlewares
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// CORS configuration
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// Body parsing with size limit
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Logging
app.use(morgan("dev"));

// General rate limiting on all routes
app.use(generalRateLimiter);

app.use("/api/inngest", serve({ client: inngest, functions: inngestFunctions }));

// Apply specific rate limiters to routes
app.use("/auth", authRateLimiter, authRoutes);
app.use("/chat", chatRateLimiter, chatRoutes);

app.use(errorHandler);
const startServer = async () => {
    try {
        await connectDb();
        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => {
            logger.info(`Server is running on PORT ${PORT}`);
            logger.info(`inngest endpoint available at http://localhost:${PORT}/api/inngest`);
        });
    } catch (error) {
        logger.error("failed to start the server", error);
        process.exit(1);
    }
}

startServer();

