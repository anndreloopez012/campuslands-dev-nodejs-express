import { Router } from "express";
import questsRouter from "./quests.routes.js";

const router = Router();

router.use("/quests", questsRouter);

export default router;
