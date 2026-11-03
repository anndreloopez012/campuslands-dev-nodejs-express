import { Router } from "express";
import resourceRouter from "./drafts.routes.js";

const router = Router();

router.use("/drafts", resourceRouter);

export default router;
