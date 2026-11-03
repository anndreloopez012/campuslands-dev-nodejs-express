import { Router } from "express";
import resourceRouter from "./fights.routes.js";

const router = Router();

router.use("/fights", resourceRouter);

export default router;
