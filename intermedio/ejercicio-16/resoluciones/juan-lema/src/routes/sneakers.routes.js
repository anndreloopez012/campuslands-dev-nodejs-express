import { Router } from "express";
import { getSneakers, getSneaker } from "../controllers/sneakers.controller.js";

const router = Router();

router.get("/", getSneakers);
router.get("/:id", getSneaker);

export default router;
