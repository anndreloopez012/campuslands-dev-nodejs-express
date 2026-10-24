import { Router } from "express";
import authRouter from "./auth.routes.js";
import chemicalsRouter from "./chemicals.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/chemicals", chemicalsRouter);

export default router;