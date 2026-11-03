import { Router } from "express";
import { getShips, getShip, postShip } from "../controllers/ships.controller.js";

const router = Router();

router.get("/", getShips);
router.get("/:id", getShip);
router.post("/", postShip);

export default router;
