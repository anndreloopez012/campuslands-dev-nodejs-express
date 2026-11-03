import { Router } from "express";
import resourceRouter from "./jobs.routes.js";

const router = Router();

router.use("/jobs", resourceRouter);

export default router;
