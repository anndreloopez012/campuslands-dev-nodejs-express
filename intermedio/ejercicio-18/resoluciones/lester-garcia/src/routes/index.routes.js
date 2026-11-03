import { Router } from "express";
import authRouter from "./auth.routes.js";
import jumpsRouter from "./jumps.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/jumps", jumpsRouter);

export default router;