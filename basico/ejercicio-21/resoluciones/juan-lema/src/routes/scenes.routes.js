import { Router } from "express";
import { getScenes, getScene, postScene } from "../controllers/scenes.controller.js";

const router = Router();

router.get("/", getScenes);
router.get("/:id", getScene);
router.post("/", postScene);

export default router;
