"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_2 = require("inngest/express");
const index_1 = require("./inngest/index");
const functions_1 = require("./inngest/functions");
const logger_1 = require("./utils/logger");
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./utils/db");
dotenv_1.default.config();
const auth_1 = __importDefault(require("./routes/auth"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const errorHandler_1 = require("./middlewares/errorHandler");
//middlewares
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use("/api/inngest", (0, express_2.serve)({ client: index_1.inngest, functions: functions_1.functions }));
//routes
app.use("/auth", auth_1.default);
app.use(errorHandler_1.errorHandler);
const startServer = async () => {
    try {
        await (0, db_1.connectDb)();
        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => {
            logger_1.logger.info(`Server is running on PORT ${PORT}`);
            logger_1.logger.info(`inngest endpoint available at http://localhost:${PORT}/api/inngest`);
        });
    }
    catch (error) {
        logger_1.logger.error("failed to start the server", error);
        process.exit(1);
    }
};
startServer();
