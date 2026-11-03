import { Router } from "express";
import resourceRouter from "./sessions.routes.js";

const router = Router();

router.use("/sessions", resourceRouter);

export default router;
