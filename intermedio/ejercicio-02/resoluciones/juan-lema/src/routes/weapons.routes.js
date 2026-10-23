import { Router } from "express";
import { getWeapons, getWeapon, postWeapon } from "../controllers/weapons.controller.js";

const router = Router();

router.get("/", getWeapons);
router.get("/:id", getWeapon);
router.post("/", postWeapon);

export default router;
