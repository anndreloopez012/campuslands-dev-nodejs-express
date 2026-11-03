import { Router } from "express";
import { getTracks, postTracksBulk } from "../controllers/tracks.controller.js";

const router = Router();

router.get("/", getTracks);
router.post("/bulk", postTracksBulk);

export default router;
