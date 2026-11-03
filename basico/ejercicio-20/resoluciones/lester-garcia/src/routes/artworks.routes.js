import { Router } from "express";
import {
  getArtworksController,
  getArtworkByIdController,
  createArtworkController
} from "../controllers/artworks.controller.js";

const router = Router();

router.get("/artworks", getArtworksController);
router.get("/artworks/:id", getArtworkByIdController);
router.post("/artworks", createArtworkController);

export default router;