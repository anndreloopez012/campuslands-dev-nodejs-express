import { Router } from "express";
import {
  getHeroesV2,
  getHeroByIdV2,
  createHeroV2
} from "../../controllers/v2/heroes.v2.controller.js";
import { validateHeroV2Payload } from "../../middlewares/validators/hero.validator.js";

const router = Router();

router.get("/", getHeroesV2);
router.get("/:id", getHeroByIdV2);
router.post("/", validateHeroV2Payload, createHeroV2);

export default router;
