import { Router } from "express";
import { listDestinations, getDestination } from "../controllers/destinations.controller.js";

const router = Router();

router.get("/", listDestinations);
router.get("/:id", getDestination);

export default router;
