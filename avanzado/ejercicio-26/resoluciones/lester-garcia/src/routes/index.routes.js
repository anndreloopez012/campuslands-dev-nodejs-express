import { Router } from "express";
import resourceRouter from "./loadouts.routes.js";

const router = Router();

router.use("/loadouts", resourceRouter);

export default router;
