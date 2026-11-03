import { Router } from "express";
import { registerController, loginController, getProfileController } from "../controllers/auth.controller.js";
import { verifyJwt } from "../middlewares/authJwt.middleware.js";
import { validate } from "../middlewares/validators/validate.middleware.js";
import { registerValidator, loginValidator } from "../middlewares/validators/auth.validator.js";

const router = Router();

router.post("/register", validate(registerValidator), registerController);
router.post("/login", validate(loginValidator), loginController);
router.get("/me", verifyJwt, getProfileController);

export default router;