import { Router } from "express";
import resourceRouter from "./appointments.routes.js";

const router = Router();

router.use("/appointments", resourceRouter);

export default router;
