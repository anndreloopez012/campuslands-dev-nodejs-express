import { Router } from "express";
import resourceRouter from "./street-orders.routes.js";

const router = Router();

router.use("/street-orders", resourceRouter);

export default router;
