import { Router } from "express";
import { getRenders, getRender, postRender } from "../controllers/renders.controller.js";
import { readLimiter, renderLimiter } from "../middlewares/rate-limit.js";

const router = Router();

router.get("/", readLimiter, getRenders);
router.get("/:id", readLimiter, getRender);
router.post("/", renderLimiter, postRender);

export default router;
