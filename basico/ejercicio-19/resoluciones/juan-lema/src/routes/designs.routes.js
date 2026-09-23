import { Router } from "express";
import { listArtistDesigns } from "../controllers/designs.controller.js";

const router = Router();

router.get("/artists/:artistId/designs", listArtistDesigns);

export default router;
