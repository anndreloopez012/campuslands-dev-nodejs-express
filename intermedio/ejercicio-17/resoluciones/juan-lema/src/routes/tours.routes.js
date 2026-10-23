import { Router } from "express";
import { getTours, getTour, postTour, removeTour } from "../controllers/tours.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

const router = Router();

router.use(authenticate);
router.get("/", authorize("tours:read"), getTours);
router.get("/:id", authorize("tours:read"), getTour);
router.post("/", authorize("tours:create"), postTour);
router.delete("/:id", authorize("tours:delete"), removeTour);

export default router;
