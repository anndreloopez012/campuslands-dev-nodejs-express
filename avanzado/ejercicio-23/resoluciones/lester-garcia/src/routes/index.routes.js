import { Router } from "express";
import resourceRouter from "./welding-tasks.routes.js";

const router = Router();

router.use("/welding-tasks", resourceRouter);

export default router;
