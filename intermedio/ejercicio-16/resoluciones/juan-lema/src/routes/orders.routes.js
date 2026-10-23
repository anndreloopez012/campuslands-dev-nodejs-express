import { Router } from "express";
import { getOrders, getOrder, postOrder } from "../controllers/orders.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

router.use(authenticate);
router.get("/", getOrders);
router.get("/:id", getOrder);
router.post("/", postOrder);

export default router;
