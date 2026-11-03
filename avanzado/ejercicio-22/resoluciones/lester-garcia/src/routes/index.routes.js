import { Router } from "express";
import resourceRouter from "./blueprints.routes.js";

const router = Router();

router.use("/blueprints", resourceRouter);

export default router;
