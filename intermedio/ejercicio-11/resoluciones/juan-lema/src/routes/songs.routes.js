import { Router } from "express";
import { getSongs, getSong, postSong } from "../controllers/songs.controller.js";

const router = Router();

router.get("/", getSongs);
router.get("/:id", getSong);
router.post("/", postSong);

export default router;
