import { Router } from "express";
import { getOrders, getOrder, postOrder, patchOrderStatus, removeOrder } from "../controllers/orders.controller.js";

const router = Router();

router.get("/", getOrders);
router.get("/:id", getOrder);
router.post("/", postOrder);
router.patch("/:id/status", patchOrderStatus);
router.delete("/:id", removeOrder);

export default router;
