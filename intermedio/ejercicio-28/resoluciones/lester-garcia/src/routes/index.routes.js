import { Router } from "express";
import loadoutsRouter from "./loadouts.routes.js";

const router = Router();

router.use("/loadouts", loadoutsRouter);

export default router;
