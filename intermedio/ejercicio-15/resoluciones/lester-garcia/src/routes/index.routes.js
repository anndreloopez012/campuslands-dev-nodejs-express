import { Router } from "express";
import authRouter from "./auth.routes.js";
import foodTrucksRouter from "./foodTrucks.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/food-trucks", foodTrucksRouter);

export default router;