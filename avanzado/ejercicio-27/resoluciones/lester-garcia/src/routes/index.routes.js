import { Router } from "express";
import resourceRouter from "./tournament-configs.routes.js";

const router = Router();

router.use("/tournament-configs", resourceRouter);

export default router;
