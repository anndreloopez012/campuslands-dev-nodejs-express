import { Router } from "express";
import workOrdersRouter from "./workOrders.routes.js";

const router = Router();

router.use("/work-orders", workOrdersRouter);

export default router;
