import { Router } from "express";
import blueprintsRouter from "./blueprints.routes.js";

const router = Router();

router.use("/blueprints", blueprintsRouter);

export default router;
