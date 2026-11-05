import { Router } from "express";
import { getDesignsByArtist } from "../controllers/designs.controller.js";

const router = Router();

router.get("/artists/:artistId/designs", getDesignsByArtist);

export default router;
