import { Router } from "express";
import resourceRouter from "./dyno-orders.routes.js";

const router = Router();

router.use("/dyno-orders", resourceRouter);

export default router;
