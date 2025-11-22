import express from "express";
import { createMood } from "../controllers/moodController";
import { auth } from "../middlewares/auth";

const router = express.Router();

router.use(auth);

router.post("/", createMood);

export default router;

