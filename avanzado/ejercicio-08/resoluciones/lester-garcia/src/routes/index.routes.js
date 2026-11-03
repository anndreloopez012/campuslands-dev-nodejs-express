import { Router } from "express";
import resourceRouter from "./telemetry.routes.js";

const router = Router();

router.use("/telemetry", resourceRouter);

export default router;
