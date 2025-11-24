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


//middlewares
const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/api/inngest", serve({ client: inngest, functions: inngestFunctions }));
//routes
app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);
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

