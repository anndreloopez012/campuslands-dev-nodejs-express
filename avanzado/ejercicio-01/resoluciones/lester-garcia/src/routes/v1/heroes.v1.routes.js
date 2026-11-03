import { Router } from "express";
import {
  getHeroesV1,
  getHeroByIdV1,
  createHeroV1
} from "../../controllers/v1/heroes.v1.controller.js";
import { validateHeroV1Payload } from "../../middlewares/validators/hero.validator.js";

const router = Router();

router.get("/", getHeroesV1);
router.get("/:id", getHeroByIdV1);
router.post("/", validateHeroV1Payload, createHeroV1);

export default router;
