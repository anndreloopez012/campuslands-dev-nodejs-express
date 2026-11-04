import { Router } from "express";
import resourceRouter from "./matches.routes.js";

const router = Router();

router.use("/matches", resourceRouter);

export default router;
