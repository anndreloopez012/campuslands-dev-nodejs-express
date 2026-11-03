import { Router } from "express";
import { getMyJumpsController, logJumpController } from "../controllers/jumps.controller.js";
import { verifyJwt } from "../middlewares/authJwt.middleware.js";
import { validate } from "../middlewares/validators/validate.middleware.js";
import { createJumpValidator } from "../middlewares/validators/jump.validator.js";

const router = Router();

router.use(verifyJwt);

router.get("/", getMyJumpsController);
router.post("/", validate(createJumpValidator), logJumpController);

export default router;