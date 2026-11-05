import { Router } from "express";
import { listAll, getOne } from "../controllers/destinations.controller.js";

const router = Router();

router.get("/destinations", listAll);
router.get("/destinations/:id", getOne);

export default router;
