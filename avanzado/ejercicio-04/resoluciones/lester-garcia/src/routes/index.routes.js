import { Router } from "express";
import resourceRouter from "./drops.routes.js";

const router = Router();

router.use("/drops", resourceRouter);

export default router;
