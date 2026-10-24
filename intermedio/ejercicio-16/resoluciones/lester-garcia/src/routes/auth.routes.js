import { Router } from "express";
import { loginController, getProfileController } from "../controllers/auth.controller.js";
import { verifyJwt } from "../middlewares/authJwt.middleware.js";
import { validate } from "../middlewares/validators/validate.middleware.js";
import { loginValidator } from "../middlewares/validators/auth.validator.js";

const router = Router();

router.post("/login", validate(loginValidator), loginController);
router.get("/me", verifyJwt, getProfileController);

export default router;