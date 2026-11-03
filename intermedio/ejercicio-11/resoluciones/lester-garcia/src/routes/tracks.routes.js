import { Router } from "express";
import {
  searchTracksController,
  getTrackByIdController
} from "../controllers/tracks.controller.js";
import { validate } from "../middlewares/validators/validate.middleware.js";
import { trackSearchValidator } from "../middlewares/validators/search.validator.js";

const router = Router();

router.get("/tracks", validate(trackSearchValidator), searchTracksController);
router.get("/tracks/:id", getTrackByIdController);

export default router;