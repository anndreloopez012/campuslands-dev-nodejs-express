import { Router } from "express";
import {
  getSongsController,
  verifyQualityController,
  createSongController
} from "../controllers/music.controller.js";

const router = Router();

router.get("/songs", getSongsController);
router.get("/songs/verify-quality", verifyQualityController);
router.post("/songs", createSongController);

export default router;