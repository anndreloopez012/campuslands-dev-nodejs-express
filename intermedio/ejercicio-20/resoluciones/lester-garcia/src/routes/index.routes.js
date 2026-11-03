import { Router } from "express";
import illustrationsRouter from "./illustrations.routes.js";

const router = Router();

router.use("/illustrations", illustrationsRouter);

export default router;
