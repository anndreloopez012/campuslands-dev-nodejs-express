import { Router } from "express";
import { getArtworks, getArtwork, postArtwork } from "../controllers/artworks.controller.js";

const router = Router();

router.get("/", getArtworks);
router.get("/:id", getArtwork);
router.post("/", postArtwork);

export default router;
