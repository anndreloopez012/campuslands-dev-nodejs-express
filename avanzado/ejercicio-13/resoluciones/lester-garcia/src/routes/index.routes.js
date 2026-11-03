import { Router } from "express";
import resourceRouter from "./missions.routes.js";

const router = Router();

router.use("/missions", resourceRouter);

export default router;
